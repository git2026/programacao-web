import express from 'express';
import { register, login, getDashboard, getUsers, editUser, removeUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/dashboard', authMiddleware, getDashboard);
router.get('/users', authMiddleware, requireAdmin, getUsers);
router.put('/users/:id', authMiddleware, requireAdmin, editUser);
router.delete('/users/:id', authMiddleware, requireAdmin, removeUser);

export default router;

