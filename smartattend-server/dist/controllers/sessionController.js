"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const Session_1 = __importDefault(require("../models/Session"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const ipNetworkService_1 = require("../services/ipNetworkService");
const socketService_1 = require("../services/socketService");
class SessionController {
    static async startSession(req, res) {
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
            const rawTeacherIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
            const teacherIP = ipNetworkService_1.IpNetworkService.normalizeIp(rawTeacherIp);
            const session = await Session_1.default.create({
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
            await AuditLog_1.default.create({
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
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to start session' });
        }
    }
    static async endSession(req, res) {
        try {
            const { id } = req.params;
            const session = await Session_1.default.findById(id) || await Session_1.default.findOne({ sessionId: id });
            if (!session) {
                return res.status(404).json({ success: false, message: 'Session not found' });
            }
            session.status = 'ended';
            await session.save();
            socketService_1.SocketService.emitSessionEnded(session._id.toString());
            return res.status(200).json({
                success: true,
                message: 'Session terminated successfully',
                session,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to end session' });
        }
    }
    static async getTeacherSessions(req, res) {
        try {
            const teacherId = req.user?.id;
            const sessions = await Session_1.default.find({ teacherId }).sort({ createdAt: -1 }).limit(50);
            return res.status(200).json({
                success: true,
                sessions,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch sessions' });
        }
    }
    static async getSessionById(req, res) {
        try {
            const { id } = req.params;
            const session = await Session_1.default.findById(id) || await Session_1.default.findOne({ sessionId: id });
            if (!session) {
                return res.status(404).json({ success: false, message: 'Session not found' });
            }
            return res.status(200).json({
                success: true,
                session,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to fetch session' });
        }
    }
}
exports.SessionController = SessionController;
