// Importações necessárias
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/serverConfig.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar aplicação Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir imagens com cache control apropriado
app.use('/assets', express.static(path.join(__dirname, '../frontend/public/assets'), {
  maxAge: '5m',
  etag: true,
  lastModified: true
}));

// Servir página de testes da API
app.get('/api-tester.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-tester.html'));
});

// Rotas principais
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor API Portfolio',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      apiTester: '/api-tester.html'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Tratamento do erro (404()
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Algo correu mal!' });
});

// Iniciar servidor
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${config.port}`);
});