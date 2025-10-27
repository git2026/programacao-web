import express from 'express';
import { register, login, getDashboard, getUsers, editUser, removeUser, clearUsers, resetUsersIds, importUsers } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { validateRegister, validateLogin, validateUpdateUser, validateDeleteUser } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Rotas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Rotas protegidas
router.get('/dashboard', authMiddleware, getDashboard);
router.get('/users', authMiddleware, requireAdmin, getUsers);
router.put('/users/:id', authMiddleware, requireAdmin, validateUpdateUser, editUser);
router.delete('/users/:id', authMiddleware, requireAdmin, validateDeleteUser, removeUser);

// Apenas Admin - operações
router.delete('/users', authMiddleware, requireAdmin, clearUsers); // Limpar todos os utilizadores
router.post('/users/reset-ids', authMiddleware, requireAdmin, resetUsersIds); // Reiniciar IDs dos utilizadores
router.post('/users/import', authMiddleware, requireAdmin, importUsers); // Importar utilizadores em lote

export default router;