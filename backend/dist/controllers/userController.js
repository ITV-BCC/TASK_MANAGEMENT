"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.toggleUserStatus = exports.resetPassword = exports.getUsers = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
// ==========================================
// Create any new User (Co-Admin or Employee)
// Returns plain password once so Admin can note it
// ==========================================
const createUser = async (req, res) => {
    try {
        const { vertical_id, first_name, last_name, email, password, role } = req.body;
        // Security: A regular Admin/Co-Admin cannot create a Global Admin
        if (req.user?.role !== 'GLOBAL_ADMIN') {
            if (role === 'GLOBAL_ADMIN' || role === 'ADMIN') {
                res.status(403).json({ success: false, message: 'You do not have permission to create this role type.' });
                return;
            }
            // Admins can only create users in their OWN vertical
            if (req.user?.vertical_id && req.user.vertical_id !== vertical_id) {
                res.status(403).json({ success: false, message: 'You can only create employees within your own Vertical.' });
                return;
            }
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db_1.default.query("INSERT INTO users (vertical_id, first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role, vertical_id", [vertical_id, first_name, last_name, email, hashedPassword, role]);
        // Return the plain password ONCE so Admin can share it with the employee
        res.status(201).json({
            success: true,
            user: result.rows[0],
            plain_password: password // Shown once, never stored
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create user' });
    }
};
exports.createUser = createUser;
// ==========================================
// Get Users based on Vertical rules + SEARCH + PAGINATION
// ==========================================
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchPattern = `%${search}%`;
        let query = '';
        let countQuery = '';
        let params = [];
        let countParams = [];
        if (req.user?.role === 'GLOBAL_ADMIN') {
            query = `
                SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, v.name as vertical_name
                FROM users u
                LEFT JOIN verticals v ON u.vertical_id = v.id
                WHERE (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)
                ORDER BY u.role, u.first_name
                LIMIT $2 OFFSET $3
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
            params = [searchPattern, limit, offset];
            countParams = [searchPattern];
        }
        else {
            query = `
                SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, v.name as vertical_name
                FROM users u
                LEFT JOIN verticals v ON u.vertical_id = v.id
                WHERE u.vertical_id = $1 AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.email ILIKE $2)
                ORDER BY u.role, u.first_name
                LIMIT $3 OFFSET $4
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE vertical_id = $1 AND (first_name ILIKE $2 OR last_name ILIKE $2 OR email ILIKE $2)`;
            params = [req.user?.vertical_id, searchPattern, limit, offset];
            countParams = [req.user?.vertical_id, searchPattern];
        }
        const [usersRes, countRes] = await Promise.all([
            db_1.default.query(query, params),
            db_1.default.query(countQuery, countParams)
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch users' });
    }
};
exports.getUsers = getUsers;
// ==========================================
// Reset a User's Password (Admin Only)
// ==========================================
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        if (!new_password || new_password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
            return;
        }
        // Verify target user exists
        const userCheck = await db_1.default.query('SELECT id, role FROM users WHERE id = $1', [id]);
        if (userCheck.rowCount === 0) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        // Only GLOBAL_ADMIN can reset Admin accounts
        if (userCheck.rows[0].role === 'GLOBAL_ADMIN' && req.user?.role !== 'GLOBAL_ADMIN') {
            res.status(403).json({ success: false, message: 'Cannot reset a Global Admin password.' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(new_password, 10);
        await db_1.default.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully.',
            plain_password: new_password // Return once so Admin can share it
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not reset password' });
    }
};
exports.resetPassword = resetPassword;
// ==========================================
// Toggle User Active/Inactive (Admin Only)
// ==========================================
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query('UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const status = result.rows[0].is_active ? 'activated' : 'deactivated';
        res.status(200).json({ success: true, message: `User ${status} successfully.`, is_active: result.rows[0].is_active });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update user status' });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// ==========================================
// Update User details (Admin Only)
// ==========================================
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, role, vertical_id } = req.body;
        if (req.user?.role !== 'GLOBAL_ADMIN' && role === 'GLOBAL_ADMIN') {
            res.status(403).json({ success: false, message: 'Only Global Admins can edit other Global Admins.' });
            return;
        }
        await db_1.default.query("UPDATE users SET first_name = $1, last_name = $2, role = $3, vertical_id = $4 WHERE id = $5", [first_name || '', last_name || '', role, vertical_id, id]);
        res.status(200).json({ success: true, message: 'User updated successfully.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update user' });
    }
};
exports.updateUser = updateUser;
