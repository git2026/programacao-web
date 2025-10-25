import express from 'express';
import { getProjects, addProject, getProject, editProject, removeProject, clearProjects, resetProjectsIds } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin, requireAdminOrEditor } from '../middleware/roleMiddleware.js';
import { validateCreateProject, validateUpdateProject, validateDeleteProject, validateGetProject } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', getProjects);
router.get('/refresh', (req, res) => {
  // Endpoint para forçar refresh - retorna dados com timestamp
  res.json({
    timestamp: new Date().toISOString(),
    message: 'Dados atualizados'
  });
});
router.get('/:id', validateGetProject, getProject);

// Rotas protegidas
router.post('/', authMiddleware, requireAdminOrEditor, validateCreateProject, addProject); // Admin ou Editor
router.put('/:id', authMiddleware, requireAdminOrEditor, validateUpdateProject, editProject); // Admin ou Editor
router.delete('/:id', authMiddleware, requireAdmin, validateDeleteProject, removeProject); // Apenas Admin

// Apenas Admin - operações
router.delete('/', authMiddleware, requireAdmin, clearProjects); // Limpar todos os projetos
router.post('/reset-ids', authMiddleware, requireAdmin, resetProjectsIds); // Reiniciar IDs dos projetos

export default router;

