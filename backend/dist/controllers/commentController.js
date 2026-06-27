"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = exports.addComment = void 0;
const db_1 = __importDefault(require("../config/db"));
// ==========================================
// Add a Comment
// ==========================================
const addComment = async (req, res) => {
    try {
        const { task_id, comment } = req.body;
        const result = await db_1.default.query("INSERT INTO task_comments (task_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *", [task_id, req.user?.id, comment]);
        res.status(201).json({ success: true, comment: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not post comment' });
    }
};
exports.addComment = addComment;
// ==========================================
// Get Comments for a Task
// ==========================================
const getComments = async (req, res) => {
    try {
        const { task_id } = req.params;
        const result = await db_1.default.query(`SELECT c.*, u.first_name, u.role 
             FROM task_comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.task_id = $1 
             ORDER BY c.created_at ASC`, [task_id]);
        res.status(200).json({ success: true, comments: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch comments' });
    }
};
exports.getComments = getComments;
