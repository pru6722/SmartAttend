"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Session_1 = __importDefault(require("../models/Session"));
const Student_1 = __importDefault(require("../models/Student"));
class ReportService {
    /**
     * Generates a detailed attendance report for a specific session
     */
    static async getSessionReportData(sessionId) {
        const session = await Session_1.default.findById(sessionId);
        if (!session)
            throw new Error('Session not found');
        const enrolledStudents = await Student_1.default.find({
            department: session.department,
            section: session.section,
        }).sort({ rollNo: 1 });
        const attendanceRecords = await Attendance_1.default.find({ sessionId: session._id });
        const attendanceMap = new Map(attendanceRecords.map((r) => [r.rollNo, r]));
        const report = enrolledStudents.map((student) => {
            const record = attendanceMap.get(student.rollNo);
            return {
                rollNo: student.rollNo,
                name: student.name,
                department: student.department,
                section: student.section,
                subject: session.subject,
                status: record ? 'Present' : 'Absent',
                timestamp: record ? record.timestamp : null,
                networkVerified: record ? record.networkVerified : false,
                faceVerified: record ? record.faceVerified : false,
                deviceId: record ? record.deviceId : '-',
            };
        });
        const totalStudents = enrolledStudents.length;
        const presentCount = attendanceRecords.length;
        const absentCount = totalStudents - presentCount;
        const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0';
        return {
            session,
            report,
            summary: {
                totalStudents,
                presentCount,
                absentCount,
                attendancePercentage: `${attendancePercentage}%`,
            },
        };
    }
}
exports.ReportService = ReportService;
