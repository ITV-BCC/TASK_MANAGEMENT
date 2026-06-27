import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Adds the 'user' object to the Express Request type safely
export interface AuthRequest extends Request {
    user?: { id: string; role: string; vertical_id: string | null };
}

// ==========================================
// Middleware to verify if user is logged in
// ==========================================
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized - No secure token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next(); // Let them proceed to the route
    } catch (error) {
        res.status(401).json({ success: false, message: 'Your session has expired. Please login again.' });
    }
};

// ==========================================
// Middleware to explicitly check if user is Global Admin
// ==========================================
export const requireGlobalAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'GLOBAL_ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Permission Denied - Global Admins Only' });
    }
};
