import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

// Get our secret key from the .env file
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ==========================================
// User Login Function
// ==========================================
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists in the database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        // 2. Check if the user was deactivated by an Admin
        if (!user.is_active) {
            res.status(403).json({ success: false, message: 'Your account has been deactivated' });
            return;
        }

        // 3. Compare the typed password with the encrypted password in DB
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        // 4. Generate the secure JWT Token with their role and vertical data
        const token = jwt.sign(
            { id: user.id, role: user.role, vertical_id: user.vertical_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 5. Send success response back to frontend
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                role: user.role,
                vertical_id: user.vertical_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server crashed during login' });
    }
};

// ==========================================
// Create Initial Global Admin
// (Used ONLY once to setup the first account)
// ==========================================
export const createFirstAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { first_name, email, password } = req.body;

        // Prevent creating multiple global admins globally from an open route
        const checkAdmin = await pool.query("SELECT * FROM users WHERE role = 'GLOBAL_ADMIN'");
        if (checkAdmin.rowCount && checkAdmin.rowCount > 0) {
            res.status(400).json({ success: false, message: 'A Global Admin already exists!' });
            return;
        }

        // Encrypt the Master Password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            "INSERT INTO users (first_name, email, password_hash, role) VALUES ($1, $2, $3, 'GLOBAL_ADMIN')",
            [first_name, email, hashedPassword]
        );

        res.status(201).json({ success: true, message: 'Global Admin created successfully. You can now login.' });
    } catch (err) {
        console.error('Setup error:', err);
        res.status(500).json({ success: false, message: 'Error creating admin account' });
    }
};
