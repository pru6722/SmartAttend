import { Response } from 'express';
import QueryTicket from '../models/QueryTicket';
import AuditLog from '../models/AuditLog';
import { AuthenticatedRequest } from '../types/index';

export class QueryController {
  // Student or Teacher: Submit Query / Update Request
  public static async createQuery(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.user?.id;
      const senderName = req.user?.name || 'User';
      const senderRole = (req.user?.role as 'student' | 'teacher') || 'student';
      const senderEmail = req.user?.email || '';

      const { subject, message, department } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'Subject and query message are required' });
      }

      const ticketId = `TKT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const query = await QueryTicket.create({
        ticketId,
        senderId,
        senderName,
        senderRole,
        senderEmail,
        department: department || 'General',
        subject,
        message,
        status: 'pending',
      });

      await AuditLog.create({
        action: 'QUERY_SUBMITTED',
        performedBy: senderEmail,
        role: senderRole,
        details: `Submitted query ${ticketId}: ${subject}`,
      });

      return res.status(201).json({ success: true, message: 'Query submitted to Admin Helpdesk successfully', query });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Student / Teacher: View My Submitted Queries
  public static async getMyQueries(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.user?.id;
      const queries = await QueryTicket.find({ senderId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, queries });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Admin: View All System Queries (With Pending Count for Bell Notification)
  public static async getAllQueries(req: AuthenticatedRequest, res: Response) {
    try {
      const queries = await QueryTicket.find().sort({ createdAt: -1 });
      const pendingCount = await QueryTicket.countDocuments({ status: 'pending' });
      return res.status(200).json({ success: true, queries, pendingCount });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Admin: Resolve & Mark Query as Completed
  public static async resolveQuery(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { adminResponse } = req.body;

      const query = await QueryTicket.findById(id) || await QueryTicket.findOne({ ticketId: id });
      if (!query) {
        return res.status(404).json({ success: false, message: 'Query ticket not found' });
      }

      query.status = 'completed';
      query.adminResponse = adminResponse || 'Approved & profile updated by Admin.';
      query.resolvedAt = new Date();
      await query.save();

      await AuditLog.create({
        action: 'QUERY_RESOLVED',
        performedBy: req.user?.email || 'Admin',
        role: 'admin',
        details: `Marked query ${query.ticketId} as COMPLETED`,
      });

      return res.status(200).json({ success: true, message: 'Query marked as COMPLETED successfully', query });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
