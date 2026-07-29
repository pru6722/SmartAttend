import { Router } from 'express';
import { TimetableController } from '../controllers/timetableController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, TimetableController.createTimetableSlot);
router.get('/', protect, TimetableController.getSectionTimetable);

export default router;
