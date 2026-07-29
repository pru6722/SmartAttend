"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timetableController_1 = require("../controllers/timetableController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.protect, timetableController_1.TimetableController.createTimetableSlot);
router.get('/', authMiddleware_1.protect, timetableController_1.TimetableController.getSectionTimetable);
exports.default = router;
