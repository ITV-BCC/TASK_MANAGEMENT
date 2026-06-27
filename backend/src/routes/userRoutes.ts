import { Router } from 'express';
import { createUser, getUsers, resetPassword, toggleUserStatus, updateUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createUser);
router.get('/', protect, getUsers);
router.put('/:id', protect, updateUser);
router.put('/:id/reset-password', protect, resetPassword);
router.put('/:id/toggle-status', protect, toggleUserStatus);


export default router;
