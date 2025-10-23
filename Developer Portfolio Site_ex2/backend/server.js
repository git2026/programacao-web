import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config/serverConfig.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});

