"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimetableController = void 0;
const Timetable_1 = __importDefault(require("../models/Timetable"));
class TimetableController {
    // Admin: Create / Update Section-wide Timetable Slot
    static async createTimetableSlot(req, res) {
        try {
            const { department, year, section, dayOfWeek, timeSlot, subjectCode, subjectTitle, teacherName, roomNo } = req.body;
            if (!department || !section || !dayOfWeek || !timeSlot || !subjectCode) {
                return res.status(400).json({ success: false, message: 'Department, section, day, time slot, and subject code are required' });
            }
            const timetableId = `TT-${department}-${year}${section}-${dayOfWeek.substring(0, 3)}-${Date.now()}`;
            const slot = await Timetable_1.default.create({
                timetableId,
                department: department.toUpperCase(),
                year: Number(year) || 1,
                section: section.toUpperCase(),
                dayOfWeek,
                timeSlot,
                subjectCode: subjectCode.toUpperCase(),
                subjectTitle: subjectTitle || 'Subject Class',
                teacherName: teacherName || 'Faculty',
                roomNo: roomNo || 'Hall 101',
            });
            return res.status(201).json({ success: true, message: `Timetable slot added for ${department}-${section} (${dayOfWeek})`, slot });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Get Timetable for Section
    static async getSectionTimetable(req, res) {
        try {
            const { department, year, section } = req.query;
            let query = {};
            if (department)
                query.department = department.toUpperCase();
            if (year)
                query.year = Number(year);
            if (section)
                query.section = section.toUpperCase();
            const timetable = await Timetable_1.default.find(query).sort({ dayOfWeek: 1, timeSlot: 1 });
            return res.status(200).json({ success: true, timetable });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.TimetableController = TimetableController;
