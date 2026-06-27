import { Router } from 'express';
import { createVertical, getVerticals, updateVertical, deleteVertical } from '../controllers/verticalController';
import { protect, requireGlobalAdmin } from '../middleware/authMiddleware';

const router = Router();

// To hit these routes, the user MUST be logged in (protect) and be a Global Admin
router.post('/', protect, requireGlobalAdmin, createVertical);
router.get('/', protect, requireGlobalAdmin, getVerticals);
router.put('/:id', protect, requireGlobalAdmin, updateVertical);
router.delete('/:id', protect, requireGlobalAdmin, deleteVertical);

export default router;
