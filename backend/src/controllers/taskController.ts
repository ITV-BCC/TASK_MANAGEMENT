import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// ==========================================
// Create a New Task (Admin / Co-Admin)
// ==========================================
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, priority, due_date, vertical_id } = req.body;
        const userRole = req.user?.role;

        if (userRole === 'EMPLOYEE') {
            res.status(403).json({ success: false, message: 'Employees cannot create tasks.' });
            return;
        }

        // Use the vertical_id provided (if Global Admin) or force the Admin's own vertical
        const finalVerticalId = userRole === 'GLOBAL_ADMIN' ? vertical_id : req.user?.vertical_id;

        const result = await pool.query(
            "INSERT INTO tasks (vertical_id, created_by, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [finalVerticalId, req.user?.id, title, description, priority || 'MEDIUM', due_date]
        );

        res.status(201).json({ success: true, task: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create task' });
    }
};

// ==========================================
// Assign Task to Employee(s)
// ==========================================
export const assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { task_id, employee_id } = req.body; 

        if (req.user?.role === 'EMPLOYEE') {
            res.status(403).json({ success: false, message: 'Employees cannot assign tasks.' });
            return;
        }

        await pool.query(
            "INSERT INTO task_assignments (task_id, employee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [task_id, employee_id]
        );

        // Update task status to ASSIGNED if it is currently CREATED
        await pool.query(
            "UPDATE tasks SET status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'CREATED'",
            [task_id]
        );

        res.status(200).json({ success: true, message: 'Task correctly assigned to employees.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not assign task' });
    }
};

// ==========================================
// Update Task Status & History (Employees / Admins)
// ==========================================
export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Task ID
        const { new_status, remark } = req.body;
        
        // Fetch current status
        const currentTask = await pool.query('SELECT status FROM tasks WHERE id = $1', [id]);
        if (currentTask.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        
        const old_status = currentTask.rows[0].status;

        // Perform the status update
        await pool.query(
            "UPDATE tasks SET status = $1, last_remark = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
            [new_status, remark || null, id]
        );

        // Record it in the History Table for Audits
        await pool.query(
            "INSERT INTO task_status_history (task_id, changed_by, old_status, new_status, remark) VALUES ($1, $2, $3, $4, $5)",
            [id, req.user?.id, old_status, new_status, remark || null]
        );

        res.status(200).json({ success: true, message: 'Task status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update task status' });
    }
};

// ==========================================
// Get Tasks (View rules based on Roles + SEARCH + PAGINATION)
// ==========================================
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchPattern = `%${search}%`;

        let query = '';
        let countQuery = '';
        let params: any[] = [];
        let countParams: any[] = [];

        if (req.user?.role === 'EMPLOYEE') {
            query = `
                SELECT t.*, v.name as vertical_name 
                FROM tasks t
                JOIN task_assignments ta ON t.id = ta.task_id
                LEFT JOIN verticals v ON t.vertical_id = v.id
                WHERE ta.employee_id = $1 AND (t.title ILIKE $2 OR t.description ILIKE $2)
                ORDER BY t.due_date ASC
                LIMIT $3 OFFSET $4
            `;
            countQuery = `
                SELECT COUNT(*) FROM tasks t 
                JOIN task_assignments ta ON t.id = ta.task_id 
                WHERE ta.employee_id = $1 AND (t.title ILIKE $2 OR t.description ILIKE $2)
            `;
            params = [req.user.id, searchPattern, limit, offset];
            countParams = [req.user.id, searchPattern];
        } else if (req.user?.role === 'GLOBAL_ADMIN') {
            query = `
                SELECT t.*, v.name as vertical_name 
                FROM tasks t
                LEFT JOIN verticals v ON t.vertical_id = v.id
                WHERE (t.title ILIKE $1 OR t.description ILIKE $1)
                ORDER BY t.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            countQuery = `SELECT COUNT(*) FROM tasks WHERE (title ILIKE $1 OR description ILIKE $1)`;
            params = [searchPattern, limit, offset];
            countParams = [searchPattern];
        } else {
            query = `
                SELECT t.*, v.name as vertical_name 
                FROM tasks t
                LEFT JOIN verticals v ON t.vertical_id = v.id
                WHERE t.vertical_id = $1 AND (t.title ILIKE $2 OR t.description ILIKE $2)
                ORDER BY t.created_at DESC
                LIMIT $3 OFFSET $4
            `;
            countQuery = `SELECT COUNT(*) FROM tasks WHERE vertical_id = $1 AND (title ILIKE $2 OR description ILIKE $2)`;
            params = [req.user?.vertical_id, searchPattern, limit, offset];
            countParams = [req.user?.vertical_id, searchPattern];
        }

        const [tasksRes, countRes] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        res.status(200).json({ 
            success: true, 
            tasks: tasksRes.rows,
            pagination: {
                total: parseInt(countRes.rows[0].count),
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(parseInt(countRes.rows[0].count) / Number(limit))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch tasks' });
    }
};
