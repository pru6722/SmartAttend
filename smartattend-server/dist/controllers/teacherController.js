"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Course_1 = __importDefault(require("../models/Course"));
class TeacherController {
    static async getProfile(req, res) {
        try {
            const teacherId = req.user?.id;
            const teacher = await User_1.default.findById(teacherId).select('-password');
            if (!teacher) {
                return res.status(404).json({ success: false, message: 'Teacher profile not found' });
            }
            // Stats for teacher dashboard profile
            const totalSessions = await Session_1.default.countDocuments({ teacherId: teacher._id });
            const assignedCourses = await Course_1.default.countDocuments({ assignedTeachers: teacher._id });
            const teacherSessions = await Session_1.default.find({ teacherId: teacher._id }).select('_id');
            const sessionIds = teacherSessions.map((s) => s._id);
            const totalAttendanceMarked = await Attendance_1.default.countDocuments({ sessionId: { $in: sessionIds } });
            return res.status(200).json({
                success: true,
                teacher: {
                    ...teacher.toObject(),
                    stats: {
                        totalSessions,
                        assignedCourses: assignedCourses || 1,
                        totalAttendanceMarked,
                    },
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const teacherId = req.user?.id;
            const { name, password, currentPassword } = req.body;
            const teacher = await User_1.default.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ success: false, message: 'Teacher not found' });
            }
            if (name)
                teacher.name = name;
            if (password) {
                if (currentPassword) {
                    const isMatch = await bcryptjs_1.default.compare(currentPassword, teacher.password);
                    if (!isMatch) {
                        return res.status(400).json({ success: false, message: 'Current password does not match' });
                    }
                }
                teacher.password = await bcryptjs_1.default.hash(password, 10);
            }
            await teacher.save();
            return res.status(200).json({ success: true, message: 'Profile updated successfully', teacher });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.TeacherController = TeacherController;
