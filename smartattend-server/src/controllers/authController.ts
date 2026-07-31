import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Student from '../models/Student';
import Department from '../models/Department';
import Course from '../models/Course';
import AuditLog from '../models/AuditLog';
import { UserRole } from '../types/index';

const JWT_SECRET = process.env.JWT_SECRET || 'smartattend_jwt_super_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'smartattend_refresh_secret_key_2026';

const generateTokens = (id: string, role: UserRole, email: string, name: string) => {
  const accessToken = jwt.sign({ id, role, email, name }, JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ id, role }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

/**
 * Ensures initial admin, teacher, and student exist in DB
 */
async function autoSeedIfEmpty() {
  const userCount = await User.countDocuments();
  const studentCount = await Student.countDocuments();

  if (userCount === 0 && studentCount === 0) {
    console.log('🌱 Auto-seeding initial SmartAttend ERP demo accounts...');

    // Departments
    await Department.create({ code: 'CSE', name: 'Computer Science & Engineering', headOfDepartment: 'Dr. Alan Turing' });
    await Department.create({ code: 'ECE', name: 'Electronics & Communication', headOfDepartment: 'Dr. Claude Shannon' });

    // Admin
    const adminPass = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'System Administrator',
      email: 'admin@smartattend.edu',
      password: adminPass,
      role: 'admin',
      department: 'CSE',
    });

    // Teacher
    const teacherPass = await bcrypt.hash('Teacher@123', 10);
    const teacher = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@smartattend.edu',
      password: teacherPass,
      role: 'teacher',
      department: 'CSE',
    });

    // Course
    await Course.create({
      courseCode: 'CS301',
      title: 'Operating Systems & Security',
      department: 'CSE',
      year: 3,
      assignedTeachers: [teacher._id],
    });

    // Student
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

    console.log('✅ Auto-seeding completed!');
  }
}

export class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      // Auto-seed if database is empty
      await autoSeedIfEmpty();

      const normalizedEmail = email.trim().toLowerCase();
      let userObj: any = null;
      let userRole: UserRole = role || 'student';

      // 1. Try finding in User collection (Teacher / Admin)
      userObj = await User.findOne({ email: normalizedEmail });
      if (userObj) {
        userRole = userObj.role;
      } else {
        // 2. Try finding in Student collection
        userObj = await Student.findOne({ email: normalizedEmail });
        if (userObj) {
          userRole = 'student';
        }
      }

      if (!userObj) {
        return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
      }

      const isMatch = await bcrypt.compare(password, userObj.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
      }

      const tokens = generateTokens(userObj._id.toString(), userRole, userObj.email, userObj.name);

      await AuditLog.create({
        action: 'USER_LOGIN',
        performedBy: userObj.email,
        role: userRole,
        details: `Successful login for ${userObj.name}`,
        ipAddress: req.ip || '',
      });

      const faceRegistered = Boolean(userObj.faceTemplateReference && userObj.faceTemplateReference.length > 5);
      const primaryDeviceRegistered = Boolean(userObj.primaryDeviceHash && userObj.primaryDeviceHash.length > 5);
      const requiresRegistration = userRole === 'student' && (!faceRegistered || !primaryDeviceRegistered);

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
          faceRegistered,
          primaryDeviceRegistered,
          requiresRegistration,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
    }
  }

  public static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
      }

      const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);
      let userObj: any = (await User.findById(decoded.id)) || (await Student.findById(decoded.id));

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
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
  }
}
