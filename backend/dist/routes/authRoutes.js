"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route: POST /api/auth/login
router.post('/login', authController_1.login);
// Route: GET /api/auth/me (Get fresh profile & department details)
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
// Route: POST /api/auth/setup-admin 
// (Only works if no admin exists yet)
router.post('/setup-admin', authController_1.createFirstAdmin);
exports.default = router;
