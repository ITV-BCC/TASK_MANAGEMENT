import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// ==========================================
// Add a Comment
// ==========================================
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { task_id, comment } = req.body;

        const result = await pool.query(
            "INSERT INTO task_comments (task_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *",
            [task_id, req.user?.id, comment]
        );

        res.status(201).json({ success: true, comment: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not post comment' });
    }
};

// ==========================================
// Get Comments for a Task
// ==========================================
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { task_id } = req.params;
        const result = await pool.query(
            `SELECT c.*, u.first_name, u.role 
             FROM task_comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.task_id = $1 
             ORDER BY c.created_at ASC`,
            [task_id]
        );
        res.status(200).json({ success: true, comments: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch comments' });
    }
};
