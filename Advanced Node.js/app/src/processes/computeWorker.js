// Worker de computação - processa tarefas intensivas de CPU via fork (processo filho)
import { heavyComputation, processArray, generatePrimes } from './tasks/dataProcessor.js';

// Escuta mensagens do processo pai
process.on('message', (message) => {
  const { task, data, taskId } = message;

  const startTime = Date.now();

  try {
    let result;

    switch (task) {
      case 'heavyComputation':
        result = heavyComputation(data.n || 10000000);
        break;

      case 'processArray':
        result = processArray(data.numbers || []);
        break;

      case 'generatePrimes':
        result = generatePrimes(data.limit || 1000);
        break;

      default:
        throw new Error(`Tarefa desconhecida: ${task}`);
    }

    const duration = Date.now() - startTime;

    // Envia resultado de volta para o pai
    process.send({
      success: true,
      result,
      duration,
      task,
      taskId
    });
  } catch (error) {
    process.send({
      success: false,
      error: error.message,
      task,
      taskId
    });
  }
});

// Trata erros
process.on('error', (error) => {
  process.send({
    success: false,
    error: error.message
  });
});

// Sinaliza que está pronto
process.send({ ready: true });
