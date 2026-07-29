import { Router } from 'express';
import { QueryController } from '../controllers/queryController';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.post('/', protect, QueryController.createQuery);
router.get('/my-queries', protect, QueryController.getMyQueries);
router.get('/admin', protect, authorizeRoles('admin'), QueryController.getAllQueries);
router.put('/admin/:id/resolve', protect, authorizeRoles('admin'), QueryController.resolveQuery);

export default router;
