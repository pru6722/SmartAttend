import { Response } from 'express';
import { ReportService } from '../services/reportService';
import { AuthenticatedRequest } from '../types/index';

export class ReportController {
  public static async getSessionReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      const data = await ReportService.getSessionReportData(sessionId as string);
      return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Failed to generate report' });
    }
  }
}
