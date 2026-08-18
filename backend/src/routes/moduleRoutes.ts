import { Router } from 'express';
import { getModules, createModule, updateModule, deleteModule } from '../controllers/moduleController';
import { protect, requireAdminOrCoAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getModules);
router.post('/', protect, requireAdminOrCoAdmin, createModule);
router.put('/:id', protect, requireAdminOrCoAdmin, updateModule);
router.delete('/:id', protect, requireAdminOrCoAdmin, deleteModule);

export default router;
