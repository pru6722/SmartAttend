import { Response } from 'express';
import Session from '../models/Session';
import AuditLog from '../models/AuditLog';
import { AuthenticatedRequest } from '../types/index';
import { IpNetworkService } from '../services/ipNetworkService';
import { SocketService } from '../services/socketService';

export class SessionController {
  public static async startSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { department, year, section, subject, networkIdentifier } = req.body;
      const teacherId = req.user?.id;
      const teacherName = req.user?.name || 'Teacher';

      if (!department || !section || !subject) {
        return res.status(400).json({ success: false, message: 'Department, section, and subject are required' });
      }

      // Generate 6-digit random code
      const attendanceCode = Math.floor(100000 + Math.random() * 900000).toString();
      const sessionId = `SES-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const startTime = new Date();
      // Expiration exactly 2 minutes (120 seconds) from start
      const expiryTime = new Date(startTime.getTime() + 2 * 60 * 1000);

      const rawTeacherIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || '127.0.0.1';
      const teacherIP = IpNetworkService.normalizeIp(rawTeacherIp);

      const session = await Session.create({
        sessionId,
        teacherId,
        teacherName,
        subject,
        department,
        year: Number(year) || 1,
        section,
        attendanceCode,
        startTime,
        expiryTime,
        teacherIP,
        networkIdentifier: networkIdentifier || '/24',
        status: 'active',
      });

      await AuditLog.create({
        action: 'SESSION_CREATED',
        performedBy: req.user?.email || 'Teacher',
        role: 'teacher',
        details: `Created session ${session.sessionId} for ${subject} (${department}-${section}) with code ${attendanceCode}`,
        ipAddress: teacherIP,
      });

      return res.status(201).json({
        success: true,
        message: 'Attendance session created successfully (Valid for 2 minutes)',
        session,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to start session' });
    }
  }

  public static async endSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const session = await Session.findById(id) || await Session.findOne({ sessionId: id });

      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      session.status = 'ended';
      await session.save();

      SocketService.emitSessionEnded(session._id.toString());

      return res.status(200).json({
        success: true,
        message: 'Session terminated successfully',
        session,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to end session' });
    }
  }

  public static async getTeacherSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const teacherId = req.user?.id;
      const sessions = await Session.find({ teacherId }).sort({ createdAt: -1 }).limit(50);

      return res.status(200).json({
        success: true,
        sessions,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch sessions' });
    }
  }

  public static async getSessionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const session = await Session.findById(id) || await Session.findOne({ sessionId: id });

      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      return res.status(200).json({
        success: true,
        session,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to fetch session' });
    }
  }
}
