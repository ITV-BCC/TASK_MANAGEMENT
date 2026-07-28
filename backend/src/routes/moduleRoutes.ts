import { Router } from 'express';
import { getModules, createModule, updateModule, deleteModule } from '../controllers/moduleController';
import { protect, requireGlobalAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getModules);
router.post('/', protect, requireGlobalAdmin, createModule);
router.put('/:id', protect, requireGlobalAdmin, updateModule);
router.delete('/:id', protect, requireGlobalAdmin, deleteModule);

export default router;
