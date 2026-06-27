import { Router } from 'express';
import { getTaskHistory, getDashboardStats } from '../controllers/statsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/task/:id/history', protect, getTaskHistory);

export default router;
