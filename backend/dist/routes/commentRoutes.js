"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const commentController_1 = require("../controllers/commentController");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, commentController_1.addComment);
router.get('/:task_id', authMiddleware_1.protect, commentController_1.getComments);
exports.default = router;
