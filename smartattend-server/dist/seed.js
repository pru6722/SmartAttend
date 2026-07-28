"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const Student_1 = __importDefault(require("./models/Student"));
const Department_1 = __importDefault(require("./models/Department"));
const Course_1 = __importDefault(require("./models/Course"));
dotenv_1.default.config();
const seed = async () => {
    try {
        const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartattend_erp';
        await mongoose_1.default.connect(connStr, { family: 4, serverSelectionTimeoutMS: 5000 });
        console.log('🌱 Seeding SmartAttend ERP database...');
        // Clear existing
        await User_1.default.deleteMany({});
        await Student_1.default.deleteMany({});
        await Department_1.default.deleteMany({});
        await Course_1.default.deleteMany({});
        // 1. Departments
        const cseDept = await Department_1.default.create({ code: 'CSE', name: 'Computer Science & Engineering', headOfDepartment: 'Dr. Alan Turing' });
        const eceDept = await Department_1.default.create({ code: 'ECE', name: 'Electronics & Communication', headOfDepartment: 'Dr. Claude Shannon' });
        // 2. Admin User
        const adminPass = await bcryptjs_1.default.hash('Admin@123', 10);
        await User_1.default.create({
            name: 'System Administrator',
            email: 'admin@smartattend.edu',
            password: adminPass,
            role: 'admin',
            department: 'CSE',
        });
        // 3. Teacher User
        const teacherPass = await bcryptjs_1.default.hash('Teacher@123', 10);
        const teacher = await User_1.default.create({
            name: 'Prof. Sarah Jenkins',
            email: 'teacher@smartattend.edu',
            password: teacherPass,
            role: 'teacher',
            department: 'CSE',
        });
        // 4. Courses
        await Course_1.default.create({
            courseCode: 'CS301',
            title: 'Operating Systems & Security',
            department: 'CSE',
            year: 3,
            assignedTeachers: [teacher._id],
        });
        // 5. Students
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
        await Student_1.default.create({
            studentId: 'STU-2026-002',
            rollNo: '21CS002',
            name: 'Sophia Chen',
            email: 'sophia@smartattend.edu',
            password: studentPass,
            department: 'CSE',
            year: 3,
            section: 'A',
            subjects: ['Operating Systems & Security', 'DBMS'],
            isActivated: true,
        });
        console.log('✅ Seeding completed successfully!');
        console.log('------------------------------------------------');
        console.log('🔑 Credentials:');
        console.log('  Admin:   admin@smartattend.edu   / Admin@123');
        console.log('  Teacher: teacher@smartattend.edu / Teacher@123');
        console.log('  Student: student@smartattend.edu / Student@123');
        console.log('------------------------------------------------');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};
seed();
