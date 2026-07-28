"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const reportService_1 = require("../services/reportService");
class ReportController {
    static async getSessionReport(req, res) {
        try {
            const { sessionId } = req.params;
            const data = await reportService_1.ReportService.getSessionReportData(sessionId);
            return res.status(200).json({ success: true, ...data });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to generate report' });
        }
    }
}
exports.ReportController = ReportController;
