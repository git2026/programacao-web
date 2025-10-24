import express from 'express';
import { getProjects, addProject, getProject, editProject, removeProject } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { validateCreateProject, validateUpdateProject, validateDeleteProject, validateGetProject } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', validateGetProject, getProject);

// Protected routes - Admin only
router.post('/', authMiddleware, requireAdmin, validateCreateProject, addProject);
router.put('/:id', authMiddleware, requireAdmin, validateUpdateProject, editProject);
router.delete('/:id', authMiddleware, requireAdmin, validateDeleteProject, removeProject);

export default router;

