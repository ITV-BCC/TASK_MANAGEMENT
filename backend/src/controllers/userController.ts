import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// ==========================================
// Create any new User (Co-Admin or Employee)
// Returns plain password once so Admin can note it
// ==========================================
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let { vertical_id, first_name, last_name, email, password, role } = req.body;
        const requesterRole = req.user?.role;
        const requesterVerticalId = req.user?.vertical_id;

        // GLOBAL_ADMIN can create any role in any department
        // ADMIN/CO_ADMIN cannot create GLOBAL_ADMIN or ADMIN roles
        if (requesterRole !== 'GLOBAL_ADMIN') {
            if (role === 'GLOBAL_ADMIN' || role === 'ADMIN') {
                res.status(403).json({ success: false, message: 'You do not have permission to create this role type.' });
                return;
            }
        }

        // CO_ADMIN: can only create EMPLOYEE role users, forced into their own vertical
        if (requesterRole === 'CO_ADMIN') {
            if (role !== 'EMPLOYEE') {
                res.status(403).json({ success: false, message: 'Co-Admins can only create Employee accounts.' });
                return;
            }
            // Force the new user into CO_ADMIN's own department — no override allowed
            vertical_id = requesterVerticalId;
        }

        // ADMIN (non-global): can only create users in their own vertical
        if (requesterRole === 'ADMIN' && requesterVerticalId && requesterVerticalId !== vertical_id) {
            res.status(403).json({ success: false, message: 'You can only create employees within your own department.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const finalVerticalId = vertical_id ? vertical_id : null;

        const result = await pool.query(
            "INSERT INTO users (vertical_id, first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role, vertical_id",
            [finalVerticalId, first_name, last_name, email, hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            user: result.rows[0],
            plain_password: password
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create user' });
    }
};

// ==========================================
// Get Users based on Vertical rules + SEARCH + PAGINATION
// ==========================================
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchPattern = `%${search}%`;

        let query = '';
        let countQuery = '';
        let params: any[] = [];
        let countParams: any[] = [];

        if (req.user?.role === 'GLOBAL_ADMIN') {
            query = `
                SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.vertical_id, v.name as vertical_name
                FROM users u
                LEFT JOIN verticals v ON u.vertical_id = v.id
                WHERE (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)
                ORDER BY u.role, u.first_name
                LIMIT $2 OFFSET $3
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
            params = [searchPattern, limit, offset];
            countParams = [searchPattern];
        } else {
            // Re-fetch the user's current vertical_id fresh from DB
            // (JWT may be stale if department was assigned after login)
            const freshUser = await pool.query('SELECT vertical_id FROM users WHERE id = $1', [req.user?.id]);
            const freshVerticalId = freshUser.rows[0]?.vertical_id ?? req.user?.vertical_id ?? null;

            if (!freshVerticalId) {
                // No department assigned — return empty list with message
                res.status(200).json({ success: true, users: [], pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 }, message: 'No department assigned' });
                return;
            }

            query = `
                SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.vertical_id, v.name as vertical_name
                FROM users u
                LEFT JOIN verticals v ON u.vertical_id = v.id
                WHERE u.vertical_id = $1 AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.email ILIKE $2)
                ORDER BY u.role, u.first_name
                LIMIT $3 OFFSET $4
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE vertical_id = $1 AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)`;
            params = [freshVerticalId, searchPattern, limit, offset];
            countParams = [freshVerticalId, searchPattern];
        }


        const [usersRes, countRes] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        res.status(200).json({ 
            success: true, 
            users: usersRes.rows,
            pagination: {
                total: parseInt(countRes.rows[0].count),
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(parseInt(countRes.rows[0].count) / Number(limit))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch users' });
    }
};

// ==========================================
// Reset a User's Password (Admin Only)
// ==========================================
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password || new_password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
            return;
        }

        // Verify target user exists
        const userCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (userCheck.rowCount === 0) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        // Only GLOBAL_ADMIN can reset Admin accounts
        if (userCheck.rows[0].role === 'GLOBAL_ADMIN' && req.user?.role !== 'GLOBAL_ADMIN') {
            res.status(403).json({ success: false, message: 'Cannot reset a Global Admin password.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully.',
            plain_password: new_password // Return once so Admin can share it
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not reset password' });
    }
};

// ==========================================
// Change Own Password
// ==========================================
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password || new_password.length < 6) {
            res.status(400).json({ success: false, message: 'Invalid input. New password must be at least 6 characters.' });
            return;
        }

        const userCheck = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userCheck.rowCount === 0) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }

        const isValid = await bcrypt.compare(current_password, userCheck.rows[0].password_hash);
        if (!isValid) {
            res.status(401).json({ success: false, message: 'Incorrect current password.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not change password.' });
    }
};

// ==========================================
// Toggle User Active/Inactive (Admin Only)
// ==========================================
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
            [id]
        );
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const status = result.rows[0].is_active ? 'activated' : 'deactivated';
        res.status(200).json({ success: true, message: `User ${status} successfully.`, is_active: result.rows[0].is_active });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update user status' });
    }
};

// ==========================================
// Update User details (Admin Only)
// ==========================================
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { first_name, last_name, role, vertical_id } = req.body;

        if (req.user?.role !== 'GLOBAL_ADMIN' && role === 'GLOBAL_ADMIN') {
            res.status(403).json({ success: false, message: 'Only Global Admins can edit other Global Admins.' });
            return;
        }

        const finalVerticalId = vertical_id ? vertical_id : null;

        await pool.query(
            "UPDATE users SET first_name = $1, last_name = $2, role = $3, vertical_id = $4 WHERE id = $5",
            [first_name || '', last_name || '', role, finalVerticalId, id]
        );

        res.status(200).json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update user' });
    }
};
