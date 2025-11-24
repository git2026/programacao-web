import express from 'express';
import {
  getProjects,
  getProject,
  addProject,
  editProject,
  removeProject,
  clearProjects,
  resetProjectsIds,
  importProjects,
  exportProjects,
  getSkills
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', getProjects);
router.get('/skills', getSkills);
router.get('/export', exportProjects);
router.get('/:id', getProject);

// Rotas protegidas (admin/editor)
router.post('/', authMiddleware, roleMiddleware(['admin', 'editor']), addProject);
router.post('/import', authMiddleware, roleMiddleware(['admin', 'editor']), importProjects);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'editor']), editProject);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), removeProject);
router.delete('/', authMiddleware, roleMiddleware(['admin']), clearProjects);
router.post('/reset-ids', authMiddleware, roleMiddleware(['admin']), resetProjectsIds);

export default router;