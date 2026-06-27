"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verticalController_1 = require("../controllers/verticalController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// To hit these routes, the user MUST be logged in (protect) and be a Global Admin
router.post('/', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.createVertical);
router.get('/', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.getVerticals);
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.updateVertical);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.requireGlobalAdmin, verticalController_1.deleteVertical);
exports.default = router;
