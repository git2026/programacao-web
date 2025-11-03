// Importações necessárias
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Porta do servidor
const PORT = process.env.PORT || 5000;

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente em falta:', missingVars.join(', '));
  console.error('   Por favor, verifique o ficheiro .env');
  process.exit(1);
}

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS: permite qualquer origem em dev, configurável em produção
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false 
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Servir assets estáticos com cache
app.use('/assets', express.static(path.join(__dirname, '../frontend/public/assets'), {
  maxAge: '5m',
  etag: true,
  lastModified: true
}));

// Página de testes da API
app.get('/api-tester.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-tester.html'));
});

// Rota principal
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

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log detalhado do erro
  if (isDevelopment) {
    console.error('Erro:', {
      mensagem: err.message,
      stack: err.stack,
      caminho: req.path,
      metodo: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  // Resposta ao cliente (com detalhes condicionais)
  const errorResponse = {
    error: isDevelopment ? err.message : 'Algo correu mal!'
  };
  
  if (isDevelopment && err.stack) {
    errorResponse.details = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// Verificar conexão MySQL ao iniciar
pool.query('SELECT 1')
  .then(() => console.log('✅ MySQL conectado'))
  .catch(err => console.error('❌ MySQL falhou:', err.message));

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor em execução em http://0.0.0.0:${PORT}`);
  console.log(`📡 API Tester: http://localhost:${PORT}/api-tester.html`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Encerramento gracioso
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} - A encerrar...`);
  server.close(() => {
    pool.end(() => process.exit(0));
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));