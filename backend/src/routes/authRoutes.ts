import { Router } from 'express';
import { login, createFirstAdmin, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Route: POST /api/auth/login
router.post('/login', login);

// Route: GET /api/auth/me (Get fresh profile & department details)
router.get('/me', protect, getMe);

// Route: POST /api/auth/setup-admin 
// (Only works if no admin exists yet)
router.post('/setup-admin', createFirstAdmin);

export default router;
