"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Student_1 = __importDefault(require("../models/Student"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Session_1 = __importDefault(require("../models/Session"));
const Exam_1 = __importDefault(require("../models/Exam"));
class StudentController {
    static async getProfile(req, res) {
        try {
            const studentId = req.user?.id;
            const student = await Student_1.default.findById(studentId).select('-password').populate('registeredDevices');
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            return res.status(200).json({ success: true, student });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const studentId = req.user?.id;
            const { password, currentPassword } = req.body;
            const student = await Student_1.default.findById(studentId);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            if (password) {
                if (currentPassword) {
                    const isMatch = await bcryptjs_1.default.compare(currentPassword, student.password);
                    if (!isMatch) {
                        return res.status(400).json({ success: false, message: 'Current password does not match' });
                    }
                }
                student.password = await bcryptjs_1.default.hash(password, 10);
                await student.save();
            }
            return res.status(200).json({ success: true, message: 'Password updated successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async setPrimaryDevice(req, res) {
        try {
            const studentId = req.user?.id;
            const { fingerprintHash, platform, browser } = req.body;
            const student = await Student_1.default.findById(studentId);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            const devId = `DEV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            student.primaryDeviceId = devId;
            student.primaryDeviceHash = fingerprintHash;
            student.primaryDeviceName = `${platform || 'Primary Mobile Device'} (${browser || 'Web Browser'})`;
            await student.save();
            return res.status(200).json({
                success: true,
                message: 'Primary campus device registered successfully',
                student,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getAttendanceHistory(req, res) {
        try {
            const studentId = req.user?.id;
            const records = await Attendance_1.default.find({ studentId }).populate('sessionId').sort({ timestamp: -1 });
            const student = await Student_1.default.findById(studentId);
            let totalSessions = 0;
            if (student) {
                totalSessions = await Session_1.default.countDocuments({
                    department: student.department,
                    section: student.section,
                });
            }
            const attendedSessions = records.length;
            const percentage = totalSessions > 0 ? ((attendedSessions / totalSessions) * 100).toFixed(1) : '100.0';
            return res.status(200).json({
                success: true,
                history: records,
                stats: {
                    totalSessions,
                    attendedSessions,
                    percentage: `${percentage}%`,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getStudentExams(req, res) {
        try {
            const studentId = req.user?.id;
            const student = await Student_1.default.findById(studentId);
            const dept = student?.department || 'CSE';
            let exams = await Exam_1.default.find({ department: dept }).sort({ examDate: 1 });
            if (exams.length === 0) {
                await Exam_1.default.create([
                    {
                        examId: 'EXM-301',
                        courseCode: 'CS301',
                        subjectTitle: 'Operating Systems & Security',
                        department: dept,
                        semester: 5,
                        examDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                        timeSlot: '10:00 AM - 01:00 PM',
                        roomAllocation: 'Hall 304 - Desk 12',
                        totalMarks: 100,
                        passingMarks: 40,
                        status: 'upcoming',
                    },
                    {
                        examId: 'EXM-302',
                        courseCode: 'CS302',
                        subjectTitle: 'Database Management Systems',
                        department: dept,
                        semester: 5,
                        examDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                        timeSlot: '02:00 PM - 05:00 PM',
                        roomAllocation: 'Hall 108 - Desk 05',
                        totalMarks: 100,
                        passingMarks: 40,
                        status: 'upcoming',
                    },
                    {
                        examId: 'EXM-303',
                        courseCode: 'CS303',
                        subjectTitle: 'Computer Networks & Protocols',
                        department: dept,
                        semester: 5,
                        examDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                        timeSlot: '10:00 AM - 01:00 PM',
                        roomAllocation: 'Hall 201 - Desk 19',
                        totalMarks: 100,
                        passingMarks: 40,
                        score: 88,
                        grade: 'A+',
                        status: 'completed',
                    },
                ]);
                exams = await Exam_1.default.find({ department: dept }).sort({ examDate: 1 });
            }
            return res.status(200).json({
                success: true,
                exams,
                semesterSummary: {
                    currentSemester: 5,
                    cgpa: '9.2',
                    sgpa: '9.4',
                    totalCredits: 24,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.StudentController = StudentController;
