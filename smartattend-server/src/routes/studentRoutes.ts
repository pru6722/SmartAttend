import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/profile', protect, authorizeRoles('student'), StudentController.getProfile);
router.put('/profile', protect, authorizeRoles('student'), StudentController.updateProfile);
router.get('/history', protect, authorizeRoles('student'), StudentController.getAttendanceHistory);
router.get('/exams', protect, authorizeRoles('student'), StudentController.getStudentExams);

export default router;
