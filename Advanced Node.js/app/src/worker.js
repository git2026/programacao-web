/**
 * Processo Worker - Servidor HTTP
 * Cada worker executa independentemente e processa pedidos
 */

import http from 'http';
import { handleUpload } from './routes/upload.js';
import { handleProcess, handleParallelProcess, handleProcessStats } from './routes/process.js';
import { handleStream, handleStreamGenerated } from './routes/stream.js';
import Logger from './utils/logger.js';
import setupGracefulShutdown from './utils/gracefulShutdown.js';
import { ensureUploadDir } from './streams/fileStream.js';

const PORT = process.env.PORT || 3000;
const logger = new Logger(process.pid);

// Garante que o diretório de uploads existe
ensureUploadDir();

// Contador de pedidos para este worker
let requestCount = 0;

// Router simples
function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  requestCount++;

  // Cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Manipuladores de rotas
  if (pathname === '/' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      worker: process.pid,
      requestCount,
      uptime: process.uptime()
    }));
    return;
  }

  if (pathname === '/upload' && method === 'POST') {
    handleUpload(req, res);
    return;
  }

  if (pathname === '/process' && method === 'GET') {
    handleProcess(req, res);
    return;
  }

  if (pathname === '/process/parallel' && method === 'GET') {
    handleParallelProcess(req, res);
    return;
  }

  if (pathname === '/process/stats' && method === 'GET') {
    handleProcessStats(req, res);
    return;
  }

  if (pathname === '/stream' && method === 'GET') {
    handleStream(req, res);
    return;
  }

  if (pathname === '/stream/generated' && method === 'GET') {
    handleStreamGenerated(req, res);
    return;
  }

  if (pathname === '/stats' && method === 'GET') {
    // Envia estatísticas do worker para o master via IPC
    if (process.send) {
      process.send({
        type: 'stats',
        workerId: process.pid,
        requestCount,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      worker: process.pid,
      requestCount,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }));
    return;
  }

  // Erro 404 - Página não encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Não encontrado' }));
}

// Cria servidor HTTP
const server = http.createServer(route);

// Inicia servidor
server.listen(PORT, () => {
  // Notifica o master que o worker está pronto
  if (process.send) {
    process.send({ type: 'ready', workerId: process.pid });
  }
});

// Trata erros do servidor
server.on('error', (error) => {
  logger.error('Erro do servidor:', error);
});

// Configura encerramento gracioso
setupGracefulShutdown(server, null, logger);

// Envia estatísticas periódicas para o master
if (process.send) {
  setInterval(() => {
    process.send({
      type: 'stats',
      workerId: process.pid,
      requestCount,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  }, 30000); // A cada 30 segundos
}

export default server;