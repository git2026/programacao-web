import express from 'express';
import { getProjects, addProject, getProject, editProject, removeProject, clearProjects, resetProjectsIds } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin, requireAdminOrEditor } from '../middleware/roleMiddleware.js';
import { validateCreateProject, validateUpdateProject, validateDeleteProject, validateGetProject } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', getProjects);
router.get('/:id', validateGetProject, getProject);

// Rotas protegidas
router.post('/', authMiddleware, requireAdminOrEditor, validateCreateProject, addProject);
router.put('/:id', authMiddleware, requireAdminOrEditor, validateUpdateProject, editProject);
router.delete('/:id', authMiddleware, requireAdmin, validateDeleteProject, removeProject);

// Apenas Admin - operações
router.delete('/', authMiddleware, requireAdmin, clearProjects);
router.post('/reset-ids', authMiddleware, requireAdmin, resetProjectsIds);
export default router;