import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { AttendanceVerificationService } from '../services/attendanceVerificationService';
import { SocketService } from '../services/socketService';
import Attendance from '../models/Attendance';

export class AttendanceController {
  public static async markAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id;
      const { attendanceCode, fingerprintHash, platform, browser, faceTemplate, biometricVerified } = req.body;

      if (!studentId) {
        return res.status(401).json({ success: false, message: 'Step 1 Failed: Unauthorized student token' });
      }

      if (!attendanceCode) {
        return res.status(400).json({ success: false, message: 'Attendance code is required' });
      }

      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || '127.0.0.1';

      // Execute 7-Step Verification Pipeline
      const result = await AttendanceVerificationService.executePipeline({
        studentId,
        sessionCode: attendanceCode,
        studentIp: rawIp,
        fingerprintHash,
        platform,
        browser,
        faceTemplate,
        biometricVerified: Boolean(biometricVerified),
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Real-time Socket.IO broadcast to teacher dashboard
      if (result.data?.session?._id) {
        SocketService.emitAttendanceMarked(result.data.session._id.toString(), {
          attendanceId: result.data.attendance.attendanceId,
          studentName: result.data.student.name,
          rollNo: result.data.student.rollNo,
          timestamp: result.data.attendance.timestamp,
          networkVerified: result.data.attendance.networkVerified,
          faceVerified: result.data.attendance.faceVerified,
        });
      }

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Server error processing attendance' });
    }
  }

  public static async getSessionAttendance(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      const records = await Attendance.find({ sessionId }).populate('studentId', 'name rollNo department section');

      return res.status(200).json({
        success: true,
        attendance: records,
        count: records.length,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch session attendance' });
    }
  }
}
