"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// To hit these routes, the user MUST be logged in (protect)
router.post('/', authMiddleware_1.protect, taskController_1.createTask);
router.post('/assign', authMiddleware_1.protect, taskController_1.assignTask);
router.put('/:id/status', authMiddleware_1.protect, taskController_1.updateTaskStatus);
router.get('/', authMiddleware_1.protect, taskController_1.getTasks);
exports.default = router;
