import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { addComment, getComments } from '../controllers/commentController';

const router = Router();

router.post('/', protect, addComment);
router.get('/:task_id', protect, getComments);

export default router;
