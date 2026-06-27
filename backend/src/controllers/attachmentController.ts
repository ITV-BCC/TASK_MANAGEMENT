import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import path from 'path';
import fs from 'fs';

// ==========================================
// Upload Attachment
// ==========================================
export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { task_id } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const result = await pool.query(
            "INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_path, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [task_id, req.user?.id, file.originalname, file.filename, file.mimetype]
        );

        res.status(201).json({ success: true, attachment: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not upload attachment' });
    }
};

// ==========================================
// Get Attachments for a Task
// ==========================================
export const getAttachments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { task_id } = req.params;
        const result = await pool.query(
            `SELECT a.*, u.first_name 
             FROM task_attachments a 
             JOIN users u ON a.uploaded_by = u.id 
             WHERE a.task_id = $1 
             ORDER BY a.created_at DESC`,
            [task_id]
        );
        res.status(200).json({ success: true, attachments: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch attachments' });
    }
};

// ==========================================
// Delete Attachment
// ==========================================
export const deleteAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const fileCheck = await pool.query("SELECT file_path FROM task_attachments WHERE id = $1", [id]);
        if (fileCheck.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Attachment not found' });
            return;
        }

        const filePath = path.join(__dirname, '../../uploads', fileCheck.rows[0].file_path);
        
        // Remove from DB
        await pool.query("DELETE FROM task_attachments WHERE id = $1", [id]);
        
        // Remove from Disk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({ success: true, message: 'Attachment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not delete attachment' });
    }
};
