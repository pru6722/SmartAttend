import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Session from '../models/Session';
import Attendance from '../models/Attendance';
import Course from '../models/Course';
import { AuthenticatedRequest } from '../types/index';

export class TeacherController {
  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const teacherId = req.user?.id;
      const teacher = await User.findById(teacherId).select('-password');

      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher profile not found' });
      }

      // Stats for teacher dashboard profile
      const totalSessions = await Session.countDocuments({ teacherId: teacher._id });
      const assignedCourses = await Course.countDocuments({ assignedTeachers: teacher._id });
      
      const teacherSessions = await Session.find({ teacherId: teacher._id }).select('_id');
      const sessionIds = teacherSessions.map((s) => s._id);
      const totalAttendanceMarked = await Attendance.countDocuments({ sessionId: { $in: sessionIds } });

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
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const teacherId = req.user?.id;
      const { name, password, currentPassword } = req.body;

      const teacher = await User.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }

      if (name) teacher.name = name;

      if (password) {
        if (currentPassword) {
          const isMatch = await bcrypt.compare(currentPassword, teacher.password);
          if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password does not match' });
          }
        }
        teacher.password = await bcrypt.hash(password, 10);
      }

      await teacher.save();
      return res.status(200).json({ success: true, message: 'Profile updated successfully', teacher });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
