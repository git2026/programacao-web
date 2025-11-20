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
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas (requerem autenticação)
router.get('/dashboard', authMiddleware, getDashboard);

// Rotas de administração
router.get('/users', authMiddleware, roleMiddleware(['admin']), getUsers);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), editUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), removeUser);
router.delete('/users', authMiddleware, roleMiddleware(['admin']), clearUsers);
router.post('/users/reset-ids', authMiddleware, roleMiddleware(['admin']), resetUsersIds);
router.post('/users/import', authMiddleware, roleMiddleware(['admin']), importUsers);
router.get('/users/export', authMiddleware, roleMiddleware(['admin']), exportUsers);

export default router;