import { Response } from 'express';
import bcrypt from 'bcryptjs';
import Student from '../models/Student';
import Attendance from '../models/Attendance';
import Session from '../models/Session';
import Exam from '../models/Exam';
import RegisteredDevice from '../models/RegisteredDevice';
import { AuthenticatedRequest } from '../types/index';

export class StudentController {
  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const student = await Student.findById(studentId).select('-password').populate('registeredDevices');

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      return res.status(200).json({ success: true, student });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const { password, currentPassword } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      if (password) {
        if (currentPassword) {
          const isMatch = await bcrypt.compare(currentPassword, student.password);
          if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password does not match' });
          }
        }
        student.password = await bcrypt.hash(password, 10);
        await student.save();
      }

      return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async setPrimaryDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const { fingerprintHash, platform, browser } = req.body;

      const student = await Student.findById(studentId);
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
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getAttendanceHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const records = await Attendance.find({ studentId }).populate('sessionId').sort({ timestamp: -1 });

      const student = await Student.findById(studentId);
      let totalSessions = 0;

      if (student) {
        totalSessions = await Session.countDocuments({
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
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getStudentExams(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const student = await Student.findById(studentId);
      const dept = student?.department || 'CSE';

      let exams = await Exam.find({ department: dept }).sort({ examDate: 1 });

      if (exams.length === 0) {
        await Exam.create([
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

        exams = await Exam.find({ department: dept }).sort({ examDate: 1 });
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
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
