// Rotas de Autenticação e Gestão de Utilizadores

import express from 'express';
import {
  register,
  login,
  getDashboard,
  getUsers,
  editUser,
  removeUser,
  clearUsers,
  resetUsersIds,
  importUsers,
  exportUsers
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/registar', register);
router.post('/login', login);

// Rotas protegidas (requerem autenticação)
router.get('/painel', authMiddleware, getDashboard);

// Rotas de administração
router.get('/utilizadores', authMiddleware, roleMiddleware(['admin']), getUsers);
router.put('/utilizadores/:id', authMiddleware, roleMiddleware(['admin']), editUser);
router.delete('/utilizadores/:id', authMiddleware, roleMiddleware(['admin']), removeUser);
router.delete('/utilizadores', authMiddleware, roleMiddleware(['admin']), clearUsers);
router.post('/utilizadores/reiniciar-ids', authMiddleware, roleMiddleware(['admin']), resetUsersIds);
router.post('/utilizadores/importar', authMiddleware, roleMiddleware(['admin']), importUsers);
router.get('/utilizadores/exportar', authMiddleware, roleMiddleware(['admin']), exportUsers);

export default router;