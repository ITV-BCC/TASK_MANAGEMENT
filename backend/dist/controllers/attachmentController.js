"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.getAttachments = exports.uploadAttachment = void 0;
const db_1 = __importDefault(require("../config/db"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ==========================================
// Upload Attachment
// ==========================================
const uploadAttachment = async (req, res) => {
    try {
        const { task_id } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const result = await db_1.default.query("INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_path, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *", [task_id, req.user?.id, file.originalname, file.filename, file.mimetype]);
        res.status(201).json({ success: true, attachment: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not upload attachment' });
    }
};
exports.uploadAttachment = uploadAttachment;
// ==========================================
// Get Attachments for a Task
// ==========================================
const getAttachments = async (req, res) => {
    try {
        const { task_id } = req.params;
        const result = await db_1.default.query(`SELECT a.*, u.first_name 
             FROM task_attachments a 
             JOIN users u ON a.uploaded_by = u.id 
             WHERE a.task_id = $1 
             ORDER BY a.created_at DESC`, [task_id]);
        res.status(200).json({ success: true, attachments: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch attachments' });
    }
};
exports.getAttachments = getAttachments;
// ==========================================
// Delete Attachment
// ==========================================
const deleteAttachment = async (req, res) => {
    try {
        const { id } = req.params;
        const fileCheck = await db_1.default.query("SELECT file_path FROM task_attachments WHERE id = $1", [id]);
        if (fileCheck.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Attachment not found' });
            return;
        }
        const filePath = path_1.default.join(__dirname, '../../uploads', fileCheck.rows[0].file_path);
        // Remove from DB
        await db_1.default.query("DELETE FROM task_attachments WHERE id = $1", [id]);
        // Remove from Disk
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        res.status(200).json({ success: true, message: 'Attachment deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not delete attachment' });
    }
};
exports.deleteAttachment = deleteAttachment;
