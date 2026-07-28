import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Protect all admin routes
router.use(protect, authorizeRoles('admin'));

router.post('/departments', AdminController.createDepartment);
router.get('/departments', AdminController.getDepartments);

router.post('/teachers', AdminController.addTeacher);
router.put('/teachers/:id', AdminController.updateTeacher);
router.get('/teachers', AdminController.getTeachers);

router.post('/students', AdminController.addStudent);
router.put('/students/:id', AdminController.updateStudent);
router.get('/students', AdminController.getStudents);

router.post('/courses', AdminController.createCourse);
router.get('/courses', AdminController.getCourses);

router.get('/analytics', AdminController.getAnalyticsOverview);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
