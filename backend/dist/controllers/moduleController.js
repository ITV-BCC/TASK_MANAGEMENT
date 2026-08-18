"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModule = exports.updateModule = exports.createModule = exports.getModules = void 0;
const db_1 = __importDefault(require("../config/db"));
const getModules = async (req, res) => {
    try {
        const { vertical_id } = req.query;
        let query = `
            SELECT m.*, v.name as vertical_name, u.first_name as assignee_first_name, u.last_name as assignee_last_name
            FROM modules m 
            JOIN verticals v ON m.vertical_id = v.id 
            LEFT JOIN users u ON m.assignee_id = u.id
            ORDER BY m.code ASC
        `;
        let params = [];
        if (vertical_id) {
            query = `
                SELECT m.*, v.name as vertical_name, u.first_name as assignee_first_name, u.last_name as assignee_last_name
                FROM modules m 
                JOIN verticals v ON m.vertical_id = v.id 
                LEFT JOIN users u ON m.assignee_id = u.id
                WHERE m.vertical_id = $1
                ORDER BY m.code ASC
            `;
            params = [vertical_id];
        }
        const result = await db_1.default.query(query, params);
        res.status(200).json({ success: true, modules: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getModules = getModules;
const createModule = async (req, res) => {
    try {
        const { vertical_id, code, name, description, assignee_id, due_date } = req.body;
        if (!vertical_id || !code || !name) {
            res.status(400).json({ success: false, message: 'Please provide all fields' });
            return;
        }
        const result = await db_1.default.query("INSERT INTO modules (vertical_id, code, name, description, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [vertical_id, code, name, description || '', assignee_id || null, due_date || null]);
        res.status(201).json({ success: true, module: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create module' });
    }
};
exports.createModule = createModule;
const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, assignee_id, due_date } = req.body;
        const result = await db_1.default.query("UPDATE modules SET code = $1, name = $2, description = $3, assignee_id = $4, due_date = $5 WHERE id = $6 RETURNING *", [code, name, description || '', assignee_id || null, due_date || null, id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Module not found' });
            return;
        }
        res.status(200).json({ success: true, module: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update module' });
    }
};
exports.updateModule = updateModule;
const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("DELETE FROM modules WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Module not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Module deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not delete module' });
    }
};
exports.deleteModule = deleteModule;
