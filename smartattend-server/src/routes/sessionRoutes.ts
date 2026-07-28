import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.post('/start', protect, authorizeRoles('teacher', 'admin'), SessionController.startSession);
router.put('/end/:id', protect, authorizeRoles('teacher', 'admin'), SessionController.endSession);
router.get('/teacher', protect, authorizeRoles('teacher', 'admin'), SessionController.getTeacherSessions);
router.get('/:id', protect, SessionController.getSessionById);

export default router;
