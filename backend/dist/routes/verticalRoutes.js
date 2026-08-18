"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verticalController_1 = require("../controllers/verticalController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Allow all authenticated users to read verticals/departments
router.get('/', authMiddleware_1.protect, verticalController_1.getVerticals);
// Only Global Admins can create, modify, or delete verticals
router.post('/', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.createVertical);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.updateVertical);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.deleteVertical);
exports.default = router;
