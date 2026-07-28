"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const Department_1 = __importDefault(require("../models/Department"));
const Course_1 = __importDefault(require("../models/Course"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const JWT_SECRET = process.env.JWT_SECRET || 'smartattend_jwt_super_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'smartattend_refresh_secret_key_2026';
const generateTokens = (id, role, email, name) => {
    const accessToken = jsonwebtoken_1.default.sign({ id, role, email, name }, JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = jsonwebtoken_1.default.sign({ id, role }, REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
/**
 * Ensures initial admin, teacher, and student exist in DB
 */
async function autoSeedIfEmpty() {
    const userCount = await User_1.default.countDocuments();
    const studentCount = await Student_1.default.countDocuments();
    if (userCount === 0 && studentCount === 0) {
        console.log('🌱 Auto-seeding initial SmartAttend ERP demo accounts...');
        // Departments
        await Department_1.default.create({ code: 'CSE', name: 'Computer Science & Engineering', headOfDepartment: 'Dr. Alan Turing' });
        await Department_1.default.create({ code: 'ECE', name: 'Electronics & Communication', headOfDepartment: 'Dr. Claude Shannon' });
        // Admin
        const adminPass = await bcryptjs_1.default.hash('Admin@123', 10);
        await User_1.default.create({
            name: 'System Administrator',
            email: 'admin@smartattend.edu',
            password: adminPass,
            role: 'admin',
            department: 'CSE',
        });
        // Teacher
        const teacherPass = await bcryptjs_1.default.hash('Teacher@123', 10);
        const teacher = await User_1.default.create({
            name: 'Prof. Sarah Jenkins',
            email: 'teacher@smartattend.edu',
            password: teacherPass,
            role: 'teacher',
            department: 'CSE',
        });
        // Course
        await Course_1.default.create({
            courseCode: 'CS301',
            title: 'Operating Systems & Security',
            department: 'CSE',
            year: 3,
            assignedTeachers: [teacher._id],
        });
        // Student
        const studentPass = await bcryptjs_1.default.hash('Student@123', 10);
        await Student_1.default.create({
            studentId: 'STU-2026-001',
            rollNo: '21CS001',
            name: 'Alex Rivera',
            email: 'student@smartattend.edu',
            password: studentPass,
            department: 'CSE',
            year: 3,
            section: 'A',
            subjects: ['Operating Systems & Security', 'DBMS', 'Computer Networks'],
            isActivated: true,
        });
        console.log('✅ Auto-seeding completed!');
    }
}
class AuthController {
    static async login(req, res) {
        try {
            const { email, password, role } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }
            // Auto-seed if database is empty
            await autoSeedIfEmpty();
            const normalizedEmail = email.trim().toLowerCase();
            let userObj = null;
            let userRole = role || 'student';
            // 1. Try finding in User collection (Teacher / Admin)
            userObj = await User_1.default.findOne({ email: normalizedEmail });
            if (userObj) {
                userRole = userObj.role;
            }
            else {
                // 2. Try finding in Student collection
                userObj = await Student_1.default.findOne({ email: normalizedEmail });
                if (userObj) {
                    userRole = 'student';
                }
            }
            if (!userObj) {
                return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
            }
            const isMatch = await bcryptjs_1.default.compare(password, userObj.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
            }
            const tokens = generateTokens(userObj._id.toString(), userRole, userObj.email, userObj.name);
            await AuditLog_1.default.create({
                action: 'USER_LOGIN',
                performedBy: userObj.email,
                role: userRole,
                details: `Successful login for ${userObj.name}`,
                ipAddress: req.ip || '',
            });
            return res.status(200).json({
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: userObj._id,
                    name: userObj.name,
                    email: userObj.email,
                    role: userRole,
                    department: userObj.department || '',
                    section: userObj.section || '',
                    rollNo: userObj.rollNo || '',
                    studentId: userObj.studentId || '',
                },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ success: false, message: 'Refresh token required' });
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
            let userObj = (await User_1.default.findById(decoded.id)) || (await Student_1.default.findById(decoded.id));
            if (!userObj) {
                return res.status(401).json({ success: false, message: 'Invalid refresh token' });
            }
            const role = decoded.role || userObj.role || 'student';
            const tokens = generateTokens(userObj._id.toString(), role, userObj.email, userObj.name);
            return res.status(200).json({
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }
    }
}
exports.AuthController = AuthController;
