// Encerramento gracioso para workers e master

export function setupGracefulShutdown(server, cluster, logger) {
  let isShuttingDown = false;

  const shutdown = (signal) => {
    // Previne múltiplas tentativas de encerramento
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    // Para de aceitar novas ligações
    server.close(() => {
      if (cluster && cluster.isPrimary) {
        // Processo master: desconecta todos os workers
        const workers = Object.values(cluster.workers || {});

        if (workers.length === 0) {
          process.exit(0);
          return;
        }

        // Espera que os workers saiam, depois encerra o master
        let exited = 0;
        const totalWorkers = workers.length;
        let shutdownInProgress = true;

        workers.forEach((worker) => {
          // Trata saída do worker
          const onExit = () => {
            exited++;
            if (exited === totalWorkers && shutdownInProgress) {
              shutdownInProgress = false;
              process.exit(0);
            }
          };

          // Verifica se o processo worker já saiu
          if (worker.process && worker.process.killed) {
            onExit();
          } else {
            worker.once('exit', onExit);
            try {
              worker.disconnect();
            } catch (error) {
            }
          }
        });

        // Se todos os workers já saíram
        if (exited === totalWorkers && shutdownInProgress) {
          shutdownInProgress = false;
          process.exit(0);
        }

        // Força encerramento após timeout
        setTimeout(() => {
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    });

    // Força encerramento após timeout
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Trata exceções não capturadas
  process.on('uncaughtException', (error) => {
    // Ignora erros EPIPE durante encerramento (workers podem já ter terminado)
    if (isShuttingDown && (error.code === 'EPIPE' || error.code === 'ERR_IPC_CHANNEL_CLOSED')) {
      return;
    }
    if (!isShuttingDown) {
      logger.error('Erro:', error.message);
      shutdown('uncaughtException');
    }
  });

  // Trata rejeições de promessas não tratadas
  process.on('unhandledRejection', (reason, promise) => {
    if (!isShuttingDown) {
      logger.error('Erro:', reason);
      shutdown('unhandledRejection');
    }
  });
}

export default setupGracefulShutdown;