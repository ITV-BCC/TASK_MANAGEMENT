"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVertical = exports.updateVertical = exports.getVerticals = exports.createVertical = void 0;
const db_1 = __importDefault(require("../config/db"));
// ==========================================
// Create a new Vertical (e.g. Sales, HR)
// ==========================================
const createVertical = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Vertical name is required' });
            return;
        }
        const result = await db_1.default.query("INSERT INTO verticals (name) VALUES ($1) RETURNING *", [name]);
        res.status(201).json({ success: true, vertical: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not create vertical' });
    }
};
exports.createVertical = createVertical;
// ==========================================
// Get all Verticals
// ==========================================
const getVerticals = async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT * FROM verticals ORDER BY created_at DESC");
        res.status(200).json({ success: true, verticals: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch verticals' });
    }
};
exports.getVerticals = getVerticals;
// ==========================================
// Update a Vertical
// ==========================================
const updateVertical = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const result = await db_1.default.query("UPDATE verticals SET name = $1 WHERE id = $2 RETURNING *", [name, id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Vertical not found' });
            return;
        }
        res.status(200).json({ success: true, vertical: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not update vertical' });
    }
};
exports.updateVertical = updateVertical;
// ==========================================
// Delete a Vertical
// ==========================================
const deleteVertical = async (req, res) => {
    try {
        const { id } = req.params;
        // Note: You might want to check if any users or tasks are linked to this vertical first
        const result = await db_1.default.query("DELETE FROM verticals WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: 'Vertical not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Vertical deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not delete vertical' });
    }
};
exports.deleteVertical = deleteVertical;
