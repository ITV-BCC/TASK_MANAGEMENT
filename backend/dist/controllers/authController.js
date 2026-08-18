"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirstAdmin = exports.getMe = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
// Get our secret key from the .env file
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// ==========================================
// User Login Function
// ==========================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Check if user exists in the database with department details
        const result = await db_1.default.query(`
            SELECT u.*, v.name as vertical_name 
            FROM users u 
            LEFT JOIN verticals v ON u.vertical_id = v.id 
            WHERE u.email = $1
        `, [email]);
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
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        // 4. Generate the secure JWT Token with their role and vertical data
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, vertical_id: user.vertical_id }, JWT_SECRET, { expiresIn: '24h' });
        // 5. Send success response back to frontend with full department information
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                vertical_id: user.vertical_id,
                vertical_name: user.vertical_name || null
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server crashed during login' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const result = await db_1.default.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.vertical_id, v.name as vertical_name 
            FROM users u 
            LEFT JOIN verticals v ON u.vertical_id = v.id 
            WHERE u.id = $1
        `, [req.user?.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, user: result.rows[0] });
    }
    catch (err) {
        console.error('getMe error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMe = getMe;
// ==========================================
// Create Initial Global Admin
// (Used ONLY once to setup the first account)
// ==========================================
const createFirstAdmin = async (req, res) => {
    try {
        const { first_name, email, password } = req.body;
        // Prevent creating multiple global admins globally from an open route
        const checkAdmin = await db_1.default.query("SELECT * FROM users WHERE role = 'GLOBAL_ADMIN'");
        if (checkAdmin.rowCount && checkAdmin.rowCount > 0) {
            res.status(400).json({ success: false, message: 'A Global Admin already exists!' });
            return;
        }
        // Encrypt the Master Password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db_1.default.query("INSERT INTO users (first_name, email, password_hash, role) VALUES ($1, $2, $3, 'GLOBAL_ADMIN')", [first_name, email, hashedPassword]);
        res.status(201).json({ success: true, message: 'Global Admin created successfully. You can now login.' });
    }
    catch (err) {
        console.error('Setup error:', err);
        res.status(500).json({ success: false, message: 'Error creating admin account' });
    }
};
exports.createFirstAdmin = createFirstAdmin;
