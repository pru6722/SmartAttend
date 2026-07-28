import { Router } from 'express';
import { TeacherController } from '../controllers/teacherController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/profile', protect, authorizeRoles('teacher', 'admin'), TeacherController.getProfile);
router.put('/profile', protect, authorizeRoles('teacher', 'admin'), TeacherController.updateProfile);

export default router;
