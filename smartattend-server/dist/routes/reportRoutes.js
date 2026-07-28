"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const router = (0, express_1.Router)();
router.get('/session/:sessionId', authMiddleware_1.protect, (0, roleMiddleware_1.authorizeRoles)('teacher', 'admin'), reportController_1.ReportController.getSessionReport);
exports.default = router;
