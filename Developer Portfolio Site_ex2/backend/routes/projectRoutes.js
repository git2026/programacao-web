import express from 'express';
import { getProjects, addProject, getProject } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected route - Admin only
router.post('/', authMiddleware, requireAdmin, addProject);

export default router;

