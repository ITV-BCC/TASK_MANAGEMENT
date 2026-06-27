"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Route: POST /api/auth/login
router.post('/login', authController_1.login);
// Route: POST /api/auth/setup-admin 
// (Only works if no admin exists yet)
router.post('/setup-admin', authController_1.createFirstAdmin);
exports.default = router;
