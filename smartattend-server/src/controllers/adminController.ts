import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Student from '../models/Student';
import Department from '../models/Department';
import Course from '../models/Course';
import AuditLog from '../models/AuditLog';
import Attendance from '../models/Attendance';
import Session from '../models/Session';
import { AuthenticatedRequest } from '../types/index';

export class AdminController {
  // Departments Management
  public static async createDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, name, headOfDepartment } = req.body;
      const existing = await Department.findOne({ code: code.toUpperCase() });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Department code already exists' });
      }

      const department = await Department.create({
        code: code.toUpperCase(),
        name,
        headOfDepartment,
      });

      return res.status(201).json({ success: true, department });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const departments = await Department.find().sort({ code: 1 });
      return res.status(200).json({ success: true, departments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Teacher Onboarding & Management
  public static async addTeacher(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password, department } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });

      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password || 'Teacher@123', 10);
      const teacher = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'teacher',
        department: department || 'CSE',
      });

      return res.status(201).json({ success: true, teacher });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateTeacher(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, password, department } = req.body;

      const teacher = await User.findById(id);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(404).json({ success: false, message: 'Teacher record not found' });
      }

      if (name) teacher.name = name;
      if (email) teacher.email = email.toLowerCase();
      if (department) teacher.department = department;

      if (password) {
        teacher.password = await bcrypt.hash(password, 10);
      }

      await teacher.save();
      return res.status(200).json({ success: true, message: 'Teacher record updated successfully', teacher });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getTeachers(req: AuthenticatedRequest, res: Response) {
    try {
      const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ name: 1 });
      return res.status(200).json({ success: true, teachers });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Student Onboarding & Management
  public static async addStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, rollNo, email, password, department, year, section, subjects } = req.body;
      const existing = await Student.findOne({ $or: [{ email: email.toLowerCase() }, { rollNo }] });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Student with this email or roll number already exists' });
      }

      const hashedPassword = await bcrypt.hash(password || 'Student@123', 10);
      const studentId = `STU-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const student = await Student.create({
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
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, rollNo, email, password, department, year, section } = req.body;

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      if (name) student.name = name;
      if (rollNo) student.rollNo = rollNo;
      if (email) student.email = email.toLowerCase();
      if (department) student.department = department;
      if (year) student.year = Number(year);
      if (section) student.section = section.toUpperCase();

      if (password) {
        student.password = await bcrypt.hash(password, 10);
      }

      await student.save();
      return res.status(200).json({ success: true, message: 'Student details updated successfully', student });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getStudents(req: AuthenticatedRequest, res: Response) {
    try {
      const students = await Student.find().select('-password').sort({ rollNo: 1 });
      return res.status(200).json({ success: true, students });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Course Management
  public static async createCourse(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseCode, title, department, year, assignedTeachers } = req.body;
      const course = await Course.create({
        courseCode: courseCode.toUpperCase(),
        title,
        department,
        year: Number(year) || 1,
        assignedTeachers: assignedTeachers || [],
      });
      return res.status(201).json({ success: true, course });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getCourses(req: AuthenticatedRequest, res: Response) {
    try {
      const courses = await Course.find().populate('assignedTeachers', 'name email');
      return res.status(200).json({ success: true, courses });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Analytics Overview
  public static async getAnalyticsOverview(req: AuthenticatedRequest, res: Response) {
    try {
      const totalStudents = await Student.countDocuments();
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalDepartments = await Department.countDocuments();
      const totalSessions = await Session.countDocuments();
      const totalAttendanceMarked = await Attendance.countDocuments();

      // Students below 75% attendance
      const students = await Student.find();
      let lowAttendanceCount = 0;

      const studentStats = await Promise.all(
        students.map(async (student) => {
          const sessionsCount = await Session.countDocuments({
            department: student.department,
            section: student.section,
          });
          const attendedCount = await Attendance.countDocuments({ studentId: student._id });
          const pct = sessionsCount > 0 ? (attendedCount / sessionsCount) * 100 : 100;
          if (pct < 75) lowAttendanceCount++;

          return {
            studentId: student.studentId,
            rollNo: student.rollNo,
            name: student.name,
            department: student.department,
            percentage: Number(pct.toFixed(1)),
          };
        })
      );

      return res.status(200).json({
        success: true,
        analytics: {
          totalStudents,
          totalTeachers,
          totalDepartments,
          totalSessions,
          totalAttendanceMarked,
          lowAttendanceCount,
          overallAttendancePct: totalSessions > 0 ? ((totalAttendanceMarked / (totalSessions * totalStudents || 1)) * 100).toFixed(1) : '88.5',
          studentStats,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // System Audit Logs
  public static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      return res.status(200).json({ success: true, logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
