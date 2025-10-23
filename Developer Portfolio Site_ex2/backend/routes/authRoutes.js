import express from 'express';
import { register, login, getDashboard } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/dashboard', authMiddleware, getDashboard);

export default router;

