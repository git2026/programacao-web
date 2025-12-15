// Processo Master do Cluster
// Gere processos workers e distribui carga

import cluster from 'cluster';
import os from 'os';
import Logger from './utils/logger.js';
import setupGracefulShutdown from './utils/gracefulShutdown.js';

const logger = new Logger();

if (cluster.isPrimary) {
  // Processo principal
  const numCPUs = os.cpus().length;
  logger.info(`Master ${process.pid} | ${numCPUs} workers`);

  const workers = new Map();
  const workerStats = new Map();

  // Cria workers
  for (let i = 0; i < numCPUs; i++) {
    forkWorker();
  }

  function forkWorker() {
    const worker = cluster.fork();

    workers.set(worker.id, {
      worker,
      pid: worker.process.pid,
      startTime: Date.now(),
      requestCount: 0
    });

    workerStats.set(worker.process.pid, {
      requestCount: 0,
      uptime: 0,
      memory: {}
    });

    // Trata mensagens do worker
    worker.on('message', (message) => {
      if (message.type === 'stats') {
        const stats = workerStats.get(message.workerId);
        if (stats) {
          stats.requestCount = message.requestCount || stats.requestCount;
          stats.uptime = message.uptime || stats.uptime;
          stats.memory = message.memory || stats.memory;
        }
      }
    });
  }

  // Trata saída do worker
  cluster.on('exit', (worker, code, signal) => {
    const workerInfo = workers.get(worker.id);
    if (workerInfo) {
      workers.delete(worker.id);
      workerStats.delete(workerInfo.pid);
      forkWorker();
    }
  });

  // Regista estatísticas dos workers periodicamente
  setInterval(() => {
    const totalRequests = Array.from(workerStats.values())
      .reduce((sum, stats) => sum + (stats.requestCount || 0), 0);
    logger.info(`Stats: ${totalRequests} pedidos totais`);
  }, 60000); // A cada 60 segundos

  // Configura encerramento gracioso
  const dummyServer = { close: (cb) => cb() };
  setupGracefulShutdown(dummyServer, cluster, logger);

  // Trata exceções não capturadas no master
  process.on('uncaughtException', (error) => {
    if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
      logger.error('Erro:', error.message);
    }
  });

} else {
  // Processo worker - importa e executa servidor worker
  import('./worker.js');
}
