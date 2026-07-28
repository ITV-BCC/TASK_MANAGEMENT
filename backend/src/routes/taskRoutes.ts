import { Router } from 'express';
import { createTask, assignTask, updateTaskStatus, getTasks, deleteTasks, bulkAssignTasks } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// To hit these routes, the user MUST be logged in (protect)
router.post('/', protect, createTask);
router.post('/assign', protect, assignTask);
router.put('/:id/status', protect, updateTaskStatus);
router.get('/', protect, getTasks);
router.post('/bulk-delete', protect, deleteTasks);
router.post('/bulk-assign', protect, bulkAssignTasks);

export default router;
