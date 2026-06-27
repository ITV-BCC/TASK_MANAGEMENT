import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// ==========================================
// Create a new Vertical (e.g. Sales, HR)
// ==========================================
export const createVertical = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ success: false, message: 'Vertical name is required' });
            return;
        }

        const result = await pool.query(
            "INSERT INTO verticals (name) VALUES ($1) RETURNING *",
            [name]
        );

        res.status(201).json({ success: true, vertical: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create vertical' });
    }
};

// ==========================================
// Get all Verticals
// ==========================================
export const getVerticals = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query("SELECT * FROM verticals ORDER BY created_at DESC");
        res.status(200).json({ success: true, verticals: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch verticals' });
    }
};

// ==========================================
// Update a Vertical
// ==========================================
export const updateVertical = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const result = await pool.query(
            "UPDATE verticals SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Vertical not found' });
            return;
        }

        res.status(200).json({ success: true, vertical: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update vertical' });
    }
};

// ==========================================
// Delete a Vertical
// ==========================================
export const deleteVertical = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Note: You might want to check if any users or tasks are linked to this vertical first
        const result = await pool.query("DELETE FROM verticals WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Vertical not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Vertical deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not delete vertical' });
    }
};
