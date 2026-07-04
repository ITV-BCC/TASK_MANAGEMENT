"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasks = exports.updateTaskStatus = exports.assignTask = exports.createTask = void 0;
const db_1 = __importDefault(require("../config/db"));
// ==========================================
// Create a New Task (Admin / Co-Admin)
// ==========================================
const createTask = async (req, res) => {
    try {
        const { title, description, priority, due_date, vertical_id } = req.body;
        const userRole = req.user?.role;
        if (userRole === 'EMPLOYEE') {
            res.status(403).json({ success: false, message: 'Employees cannot create tasks.' });
            return;
        }
        // Use the vertical_id provided (if Global Admin) or force the Admin's own vertical
        const finalVerticalId = userRole === 'GLOBAL_ADMIN' ? vertical_id : req.user?.vertical_id;
        const result = await db_1.default.query("INSERT INTO tasks (vertical_id, created_by, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [finalVerticalId, req.user?.id, title, description, priority || 'MEDIUM', due_date]);
        res.status(201).json({ success: true, task: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create task' });
    }
};
exports.createTask = createTask;
// ==========================================
// Assign Task to Employee(s)
// ==========================================
const assignTask = async (req, res) => {
    try {
        const { task_id, employee_id } = req.body;
        if (req.user?.role === 'EMPLOYEE') {
            res.status(403).json({ success: false, message: 'Employees cannot assign tasks.' });
            return;
        }
        // Toggle user assignment check
        const check = await db_1.default.query("SELECT 1 FROM task_assignments WHERE task_id = $1 AND employee_id = $2", [task_id, employee_id]);
        if (check.rowCount && check.rowCount > 0) {
            // Already assigned, so REMOVE them
            await db_1.default.query("DELETE FROM task_assignments WHERE task_id = $1 AND employee_id = $2", [task_id, employee_id]);
            // Check if there are any assignments left for this task
            const countCheck = await db_1.default.query("SELECT COUNT(*) as count FROM task_assignments WHERE task_id = $1", [task_id]);
            const numLeft = parseInt(countCheck.rows[0].count);
            if (numLeft === 0) {
                // Change status back to 'CREATED' if no assignments remain
                await db_1.default.query("UPDATE tasks SET status = 'CREATED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'ASSIGNED'", [task_id]);
            }
            res.status(200).json({ success: true, message: 'Employee removed from task.', assigned: false });
        }
        else {
            // Add assignment
            await db_1.default.query("INSERT INTO task_assignments (task_id, employee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [task_id, employee_id]);
            // Update task status to ASSIGNED if it is currently CREATED
            await db_1.default.query("UPDATE tasks SET status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'CREATED'", [task_id]);
            res.status(200).json({ success: true, message: 'Employee assigned to task.', assigned: true });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not assign task' });
    }
};
exports.assignTask = assignTask;
// ==========================================
// Update Task Status & History (Employees / Admins)
// ==========================================
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params; // Task ID
        const { new_status, remark } = req.body;
        // Fetch current status
        const currentTask = await db_1.default.query('SELECT status FROM tasks WHERE id = $1', [id]);
        if (currentTask.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
        const old_status = currentTask.rows[0].status;
        // Perform the status update
        await db_1.default.query("UPDATE tasks SET status = $1, last_remark = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3", [new_status, remark || null, id]);
        // Record it in the History Table for Audits
        await db_1.default.query("INSERT INTO task_status_history (task_id, changed_by, old_status, new_status, remark) VALUES ($1, $2, $3, $4, $5)", [id, req.user?.id, old_status, new_status, remark || null]);
        res.status(200).json({ success: true, message: 'Task status updated successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update task status' });
    }
};
exports.updateTaskStatus = updateTaskStatus;
// ==========================================
// Get Tasks (View rules based on Roles + SEARCH + PAGINATION)
// ==========================================
const getTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '', priority = '', sortBy = 'newest' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const searchPattern = `%${search}%`;
        let selectFields = `
            t.*, v.name as vertical_name,
            COALESCE(sub_assign.assigned_users, '[]'::json) as assigned_users
        `;
        let fromClause = `
            tasks t
            LEFT JOIN verticals v ON t.vertical_id = v.id
            LEFT JOIN (
                SELECT ta.task_id, 
                       JSON_AGG(JSON_BUILD_OBJECT('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name)) as assigned_users
                FROM task_assignments ta
                JOIN users u ON ta.employee_id = u.id
                GROUP BY ta.task_id
            ) sub_assign ON t.id = sub_assign.task_id
        `;
        let whereClauses = [];
        let params = [];
        // 1. Role-based scoping
        if (req.user?.role === 'EMPLOYEE') {
            fromClause += ` JOIN task_assignments ta ON t.id = ta.task_id`;
            params.push(req.user.id);
            whereClauses.push(`ta.employee_id = $${params.length}`);
        }
        else if (req.user?.role !== 'GLOBAL_ADMIN') {
            params.push(req.user?.vertical_id);
            whereClauses.push(`t.vertical_id = $${params.length}`);
        }
        // 2. Search filter
        params.push(searchPattern);
        whereClauses.push(`(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
        // 3. Status filter
        if (status && status !== 'ALL') {
            params.push(status);
            whereClauses.push(`t.status = $${params.length}`);
        }
        // 4. Priority filter
        if (priority && priority !== 'ALL') {
            params.push(priority);
            whereClauses.push(`t.priority = $${params.length}`);
        }
        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        // 5. Sorting
        let orderClause = 'ORDER BY t.created_at DESC';
        if (sortBy === 'due_date') {
            orderClause = 'ORDER BY t.due_date ASC NULLS LAST';
        }
        else if (sortBy === 'priority') {
            orderClause = `
                ORDER BY 
                    CASE t.priority 
                        WHEN 'HIGH' THEN 1 
                        WHEN 'MEDIUM' THEN 2 
                        WHEN 'LOW' THEN 3 
                        ELSE 4 
                    END ASC, t.created_at DESC
            `;
        }
        else if (sortBy === 'newest') {
            orderClause = 'ORDER BY t.created_at DESC';
        }
        else if (sortBy === 'oldest') {
            orderClause = 'ORDER BY t.created_at ASC';
        }
        const totalParamsCount = params.length;
        const listQuery = `
            SELECT ${selectFields}
            FROM ${fromClause}
            ${whereString}
            ${orderClause}
            LIMIT $${totalParamsCount + 1} OFFSET $${totalParamsCount + 2}
        `;
        const listParams = [...params, limit, offset];
        const countQuery = `
            SELECT COUNT(DISTINCT t.id) as count
            FROM ${fromClause}
            ${whereString}
        `;
        const [tasksRes, countRes] = await Promise.all([
            db_1.default.query(listQuery, listParams),
            db_1.default.query(countQuery, params)
        ]);
        const totalItems = parseInt(countRes.rows[0].count);
        res.status(200).json({
            success: true,
            tasks: tasksRes.rows,
            pagination: {
                total: totalItems,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(totalItems / Number(limit))
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch tasks' });
    }
};
exports.getTasks = getTasks;
