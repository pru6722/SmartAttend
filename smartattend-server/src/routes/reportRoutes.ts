import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/session/:sessionId', protect, authorizeRoles('teacher', 'admin'), ReportController.getSessionReport);

export default router;
