import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.get('/profile', protect, authorizeRoles('student', 'admin', 'teacher'), StudentController.getProfile);
router.put('/profile', protect, authorizeRoles('student', 'admin', 'teacher'), StudentController.updateProfile);
router.post('/register-face-device', protect, authorizeRoles('student', 'admin', 'teacher'), StudentController.registerFaceAndDevice);
router.put('/primary-device', protect, authorizeRoles('student'), StudentController.setPrimaryDevice);
router.get('/history', protect, authorizeRoles('student'), StudentController.getAttendanceHistory);
router.get('/exams', protect, authorizeRoles('student'), StudentController.getStudentExams);

export default router;

