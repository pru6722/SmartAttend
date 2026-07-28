import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { attendanceSubmissionLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/mark', protect, authorizeRoles('student', 'teacher', 'admin'), attendanceSubmissionLimiter, AttendanceController.markAttendance);
router.get('/session/:sessionId', protect, authorizeRoles('teacher', 'admin'), AttendanceController.getSessionAttendance);

export default router;
