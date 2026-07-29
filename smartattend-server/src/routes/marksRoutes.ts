import { Router } from 'express';
import { MarksController } from '../controllers/marksController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.post('/', protect, authorizeRoles('teacher'), MarksController.enterMarks);
router.get('/teacher', protect, authorizeRoles('teacher'), MarksController.getTeacherMarks);
router.get('/student', protect, authorizeRoles('student'), MarksController.getStudentMarks);

export default router;
