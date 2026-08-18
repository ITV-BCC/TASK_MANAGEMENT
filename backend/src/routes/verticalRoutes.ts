import { Router } from 'express';
import { createVertical, getVerticals, updateVertical, deleteVertical } from '../controllers/verticalController';
import { protect, requireGlobalAdmin } from '../middleware/authMiddleware';

const router = Router();

// Allow all authenticated users to read verticals/departments
router.get('/', protect, getVerticals);

// Only Global Admins can create, modify, or delete verticals
router.post('/', protect, requireGlobalAdmin, createVertical);
router.put('/:id', protect, requireGlobalAdmin, updateVertical);
router.delete('/:id', protect, requireGlobalAdmin, deleteVertical);

export default router;
