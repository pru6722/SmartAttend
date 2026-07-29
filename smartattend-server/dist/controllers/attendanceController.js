"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendanceVerificationService_1 = require("../services/attendanceVerificationService");
const socketService_1 = require("../services/socketService");
const Attendance_1 = __importDefault(require("../models/Attendance"));
class AttendanceController {
    static async markAttendance(req, res) {
        try {
            const studentId = req.user?.id;
            const { attendanceCode, fingerprintHash, platform, browser, faceTemplate, biometricVerified } = req.body;
            if (!studentId) {
                return res.status(401).json({ success: false, message: 'Step 1 Failed: Unauthorized student token' });
            }
            if (!attendanceCode) {
                return res.status(400).json({ success: false, message: 'Attendance code is required' });
            }
            const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
            // Execute 7-Step Verification Pipeline
            const result = await attendanceVerificationService_1.AttendanceVerificationService.executePipeline({
                studentId,
                sessionCode: attendanceCode,
                studentIp: rawIp,
                fingerprintHash,
                platform,
                browser,
                faceTemplate,
                biometricVerified: Boolean(biometricVerified),
            });
            if (!result.success) {
                return res.status(400).json(result);
            }
            // Real-time Socket.IO broadcast to teacher dashboard
            if (result.data?.session?._id) {
                socketService_1.SocketService.emitAttendanceMarked(result.data.session._id.toString(), {
                    attendanceId: result.data.attendance.attendanceId,
                    studentName: result.data.student.name,
                    rollNo: result.data.student.rollNo,
                    timestamp: result.data.attendance.timestamp,
                    networkVerified: result.data.attendance.networkVerified,
                    faceVerified: result.data.attendance.faceVerified,
                });
            }
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Server error processing attendance' });
        }
    }
    static async getSessionAttendance(req, res) {
        try {
            const { sessionId } = req.params;
            const records = await Attendance_1.default.find({ sessionId }).populate('studentId', 'name rollNo department section');
            return res.status(200).json({
                success: true,
                attendance: records,
                count: records.length,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch session attendance' });
        }
    }
}
exports.AttendanceController = AttendanceController;
