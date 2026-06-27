import { Router } from 'express';
import { login, createFirstAdmin } from '../controllers/authController';

const router = Router();

// Route: POST /api/auth/login
router.post('/login', login);

// Route: POST /api/auth/setup-admin 
// (Only works if no admin exists yet)
router.post('/setup-admin', createFirstAdmin);

export default router;
