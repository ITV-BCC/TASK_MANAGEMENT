"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/dashboard', authMiddleware_1.protect, statsController_1.getDashboardStats);
router.get('/task/:id/history', authMiddleware_1.protect, statsController_1.getTaskHistory);
exports.default = router;
