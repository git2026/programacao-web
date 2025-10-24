import express from 'express';
import { register, login, getDashboard, getUsers, editUser, removeUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { validateRegister, validateLogin, validateUpdateUser, validateDeleteUser } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/dashboard', authMiddleware, getDashboard);
router.get('/users', authMiddleware, requireAdmin, getUsers);
router.put('/users/:id', authMiddleware, requireAdmin, validateUpdateUser, editUser);
router.delete('/users/:id', authMiddleware, requireAdmin, validateDeleteUser, removeUser);

export default router;

