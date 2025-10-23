import express from 'express';
import { getProjects, addProject, getProject, editProject, removeProject } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes - Admin only
router.post('/', authMiddleware, requireAdmin, addProject);
router.put('/:id', authMiddleware, requireAdmin, editProject);
router.delete('/:id', authMiddleware, requireAdmin, removeProject);

export default router;

