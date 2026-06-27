"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getTaskHistory = void 0;
const db_1 = __importDefault(require("../config/db"));
// ==========================================
// Get Audit Trail for a specific task
// ==========================================
const getTaskHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query(`
            SELECT h.*, u.first_name, u.role
            FROM task_status_history h
            JOIN users u ON h.changed_by = u.id
            WHERE h.task_id = $1
            ORDER BY h.changed_at DESC
        `, [id]);
        res.status(200).json({ success: true, history: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch history' });
    }
};
exports.getTaskHistory = getTaskHistory;
// ==========================================
// Get Global Stats for Dashboard (Enhanced)
// ==========================================
const getDashboardStats = async (req, res) => {
    try {
        const { role, id, vertical_id } = req.user;
        let stats = {};
        let verticalStats = [];
        let trendData = [];
        // 1. Basic Stats
        let statsQuery = '';
        let params = [];
        if (role === 'GLOBAL_ADMIN') {
            statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM tasks) as total_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE status = 'IN_PROGRESS') as in_progress,
                    (SELECT COUNT(*) FROM tasks WHERE status IN ('COMPLETED', 'REVIEWED')) as completed,
                    (SELECT COUNT(*) FROM tasks WHERE status = 'REWORK') as pending_rework,
                    (SELECT COUNT(*) FROM users) as total_users
            `;
            // 2. Vertical-wise Distribution (Only for Global Admin)
            const vRes = await db_1.default.query(`
                SELECT v.name, COUNT(t.id) as count
                FROM verticals v
                LEFT JOIN tasks t ON v.id = t.vertical_id
                GROUP BY v.name
                ORDER BY count DESC
            `);
            verticalStats = vRes.rows;
        }
        else if (role === 'EMPLOYEE') {
            statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM task_assignments WHERE employee_id = $1) as total_tasks,
                    (SELECT COUNT(*) FROM tasks t JOIN task_assignments ta ON t.id = ta.task_id WHERE ta.employee_id = $1 AND t.status = 'IN_PROGRESS') as in_progress,
                    (SELECT COUNT(*) FROM tasks t JOIN task_assignments ta ON t.id = ta.task_id WHERE ta.employee_id = $1 AND t.status IN ('COMPLETED', 'REVIEWED')) as completed,
                    (SELECT COUNT(*) FROM tasks t JOIN task_assignments ta ON t.id = ta.task_id WHERE ta.employee_id = $1 AND t.status = 'REWORK') as pending_rework
            `;
            params = [id];
        }
        else {
            statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM tasks WHERE vertical_id = $1) as total_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE vertical_id = $1 AND status = 'IN_PROGRESS') as in_progress,
                    (SELECT COUNT(*) FROM tasks WHERE vertical_id = $1 AND status IN ('COMPLETED', 'REVIEWED')) as completed,
                    (SELECT COUNT(*) FROM tasks WHERE vertical_id = $1 AND status = 'REWORK') as pending_rework,
                    (SELECT COUNT(*) FROM users WHERE vertical_id = $1) as total_users
            `;
            params = [vertical_id];
        }
        const statsResult = await db_1.default.query(statsQuery, params);
        stats = statsResult.rows[0];
        // 3. Last 7 Days Completion Trend
        const trendRes = await db_1.default.query(`
            SELECT 
                TO_CHAR(d.day, 'DD Mon') as label,
                COUNT(t.id) as count
            FROM (
                SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) as day
            ) d
            LEFT JOIN tasks t ON DATE(t.updated_at) = DATE(d.day) AND t.status IN ('COMPLETED', 'REVIEWED')
            ${role !== 'GLOBAL_ADMIN' ? (role === 'EMPLOYEE' ?
            'JOIN task_assignments ta ON t.id = ta.task_id WHERE ta.employee_id = $1' :
            'WHERE t.vertical_id = $1') : ''}
            GROUP BY d.day
            ORDER BY d.day ASC
        `, role !== 'GLOBAL_ADMIN' ? [role === 'EMPLOYEE' ? id : vertical_id] : []);
        trendData = trendRes.rows;
        res.status(200).json({
            success: true,
            stats,
            verticalStats,
            trendData
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
