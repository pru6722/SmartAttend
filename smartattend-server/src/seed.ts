import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Student from './models/Student';
import Department from './models/Department';
import Course from './models/Course';

dotenv.config();

const seed = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartattend_erp';
    await mongoose.connect(connStr, { family: 4, serverSelectionTimeoutMS: 5000 });
    console.log('🌱 Seeding SmartAttend ERP database...');

    // Clear existing
    await User.deleteMany({});
    await Student.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});

    // 1. Departments
    const cseDept = await Department.create({ code: 'CSE', name: 'Computer Science & Engineering', headOfDepartment: 'Dr. Alan Turing' });
    const eceDept = await Department.create({ code: 'ECE', name: 'Electronics & Communication', headOfDepartment: 'Dr. Claude Shannon' });

    // 2. Admin User
    const adminPass = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'System Administrator',
      email: 'admin@smartattend.edu',
      password: adminPass,
      role: 'admin',
      department: 'CSE',
    });

    // 3. Teacher User
    const teacherPass = await bcrypt.hash('Teacher@123', 10);
    const teacher = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@smartattend.edu',
      password: teacherPass,
      role: 'teacher',
      department: 'CSE',
    });

    // 4. Courses
    await Course.create({
      courseCode: 'CS301',
      title: 'Operating Systems & Security',
      department: 'CSE',
      year: 3,
      assignedTeachers: [teacher._id],
    });

    // 5. Students
    const studentPass = await bcrypt.hash('Student@123', 10);
    await Student.create({
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

    await Student.create({
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
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
