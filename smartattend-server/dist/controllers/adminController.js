"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const Department_1 = __importDefault(require("../models/Department"));
const Course_1 = __importDefault(require("../models/Course"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Session_1 = __importDefault(require("../models/Session"));
class AdminController {
    // Departments Management
    static async createDepartment(req, res) {
        try {
            const { code, name, headOfDepartment } = req.body;
            const existing = await Department_1.default.findOne({ code: code.toUpperCase() });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Department code already exists' });
            }
            const department = await Department_1.default.create({
                code: code.toUpperCase(),
                name,
                headOfDepartment,
            });
            return res.status(201).json({ success: true, department });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getDepartments(req, res) {
        try {
            const departments = await Department_1.default.find().sort({ code: 1 });
            return res.status(200).json({ success: true, departments });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Teacher Onboarding & Management
    static async addTeacher(req, res) {
        try {
            const { name, email, password, department } = req.body;
            const existing = await User_1.default.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ success: false, message: 'User with this email already exists' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password || 'Teacher@123', 10);
            const teacher = await User_1.default.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'teacher',
                department: department || 'CSE',
            });
            return res.status(201).json({ success: true, teacher });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateTeacher(req, res) {
        try {
            const { id } = req.params;
            const { name, email, password, department } = req.body;
            const teacher = await User_1.default.findById(id);
            if (!teacher || teacher.role !== 'teacher') {
                return res.status(404).json({ success: false, message: 'Teacher record not found' });
            }
            if (name)
                teacher.name = name;
            if (email)
                teacher.email = email.toLowerCase();
            if (department)
                teacher.department = department;
            if (password) {
                teacher.password = await bcryptjs_1.default.hash(password, 10);
            }
            await teacher.save();
            return res.status(200).json({ success: true, message: 'Teacher record updated successfully', teacher });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getTeachers(req, res) {
        try {
            const teachers = await User_1.default.find({ role: 'teacher' }).select('-password').sort({ name: 1 });
            return res.status(200).json({ success: true, teachers });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Student Onboarding & Management
    static async addStudent(req, res) {
        try {
            const { name, rollNo, email, password, department, year, section, subjects } = req.body;
            const existing = await Student_1.default.findOne({ $or: [{ email: email.toLowerCase() }, { rollNo }] });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Student with this email or roll number already exists' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password || 'Student@123', 10);
            const studentId = `STU-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
            const student = await Student_1.default.create({
                studentId,
                rollNo,
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                department,
                year: Number(year) || 1,
                section: section.toUpperCase(),
                subjects: subjects || [],
                isActivated: true,
            });
            return res.status(201).json({ success: true, student });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const { name, rollNo, email, password, department, year, section } = req.body;
            const student = await Student_1.default.findById(id);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            if (name)
                student.name = name;
            if (rollNo)
                student.rollNo = rollNo;
            if (email)
                student.email = email.toLowerCase();
            if (department)
                student.department = department;
            if (year)
                student.year = Number(year);
            if (section)
                student.section = section.toUpperCase();
            if (password) {
                student.password = await bcryptjs_1.default.hash(password, 10);
            }
            await student.save();
            return res.status(200).json({ success: true, message: 'Student details updated successfully', student });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getStudents(req, res) {
        try {
            const students = await Student_1.default.find().select('-password').sort({ rollNo: 1 });
            return res.status(200).json({ success: true, students });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Course Management
    static async createCourse(req, res) {
        try {
            const { courseCode, title, department, year, assignedTeachers } = req.body;
            const course = await Course_1.default.create({
                courseCode: courseCode.toUpperCase(),
                title,
                department,
                year: Number(year) || 1,
                assignedTeachers: assignedTeachers || [],
            });
            return res.status(201).json({ success: true, course });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getCourses(req, res) {
        try {
            const courses = await Course_1.default.find().populate('assignedTeachers', 'name email');
            return res.status(200).json({ success: true, courses });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // Analytics Overview - 100% Real-Time Dynamic DB Calculations
    static async getAnalyticsOverview(req, res) {
        try {
            const totalStudents = await Student_1.default.countDocuments();
            const totalTeachers = await User_1.default.countDocuments({ role: 'teacher' });
            const totalDepartments = await Department_1.default.countDocuments();
            const totalSessions = await Session_1.default.countDocuments();
            const totalAttendanceMarked = await Attendance_1.default.countDocuments();
            const students = await Student_1.default.find();
            let lowAttendanceCount = 0;
            const studentStats = await Promise.all(students.map(async (student) => {
                const sessionsCount = await Session_1.default.countDocuments({
                    department: student.department,
                    section: student.section,
                });
                const attendedCount = await Attendance_1.default.countDocuments({ studentId: student._id });
                const pct = sessionsCount > 0 ? (attendedCount / sessionsCount) * 100 : 100;
                if (pct < 75)
                    lowAttendanceCount++;
                return {
                    studentId: student.studentId,
                    rollNo: student.rollNo,
                    name: student.name,
                    department: student.department,
                    percentage: Number(pct.toFixed(1)),
                };
            }));
            const overallAttendancePct = totalSessions > 0 && totalStudents > 0
                ? ((totalAttendanceMarked / (totalSessions * totalStudents)) * 100).toFixed(1)
                : '0.0';
            return res.status(200).json({
                success: true,
                analytics: {
                    totalStudents,
                    totalTeachers,
                    totalDepartments,
                    totalSessions,
                    totalAttendanceMarked,
                    lowAttendanceCount,
                    overallAttendancePct: `${overallAttendancePct}%`,
                    studentStats,
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // System Audit Logs
    static async getAuditLogs(req, res) {
        try {
            const logs = await AuditLog_1.default.find().sort({ createdAt: -1 }).limit(100);
            return res.status(200).json({ success: true, logs });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AdminController = AdminController;
