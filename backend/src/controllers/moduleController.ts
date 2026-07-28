import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getModules = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { vertical_id } = req.query;
        let query = `
            SELECT m.*, v.name as vertical_name 
            FROM modules m 
            JOIN verticals v ON m.vertical_id = v.id 
            ORDER BY m.code ASC
        `;
        let params: any[] = [];
        
        if (vertical_id) {
            query = `
                SELECT m.*, v.name as vertical_name 
                FROM modules m 
                JOIN verticals v ON m.vertical_id = v.id 
                WHERE m.vertical_id = $1
                ORDER BY m.code ASC
            `;
            params = [vertical_id];
        }

        const result = await pool.query(query, params);
        res.status(200).json({ success: true, modules: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { vertical_id, code, name } = req.body;
        
        if (!vertical_id || !code || !name) {
            res.status(400).json({ success: false, message: 'Please provide all fields' });
            return;
        }

        const result = await pool.query(
            "INSERT INTO modules (vertical_id, code, name) VALUES ($1, $2, $3) RETURNING *",
            [vertical_id, code, name]
        );
        res.status(201).json({ success: true, module: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create module' });
    }
};

export const updateModule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { code, name } = req.body;

        const result = await pool.query(
            "UPDATE modules SET code = $1, name = $2 WHERE id = $3 RETURNING *",
            [code, name, id]
        );
        
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Module not found' });
            return;
        }
        
        res.status(200).json({ success: true, module: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update module' });
    }
};

export const deleteModule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM modules WHERE id = $1 RETURNING *", [id]);
        
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Module not found' });
            return;
        }
        
        res.status(200).json({ success: true, message: 'Module deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not delete module' });
    }
};
