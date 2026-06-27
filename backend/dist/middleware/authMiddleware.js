"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireGlobalAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// ==========================================
// Middleware to verify if user is logged in
// ==========================================
const protect = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized - No secure token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next(); // Let them proceed to the route
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Your session has expired. Please login again.' });
    }
};
exports.protect = protect;
// ==========================================
// Middleware to explicitly check if user is Global Admin
// ==========================================
const requireGlobalAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'GLOBAL_ADMIN') {
        next();
    }
    else {
        res.status(403).json({ success: false, message: 'Permission Denied - Global Admins Only' });
    }
};
exports.requireGlobalAdmin = requireGlobalAdmin;
