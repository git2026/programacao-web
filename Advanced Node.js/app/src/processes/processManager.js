
// Gestor de Processos Filhos - gere um conjunto de workers criados via fork para tarefas intensivas de CPU

import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProcessManager {
  constructor(maxWorkers = 4) {
    this.maxWorkers = maxWorkers;
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.taskIdCounter = 0;

    this.initWorkers();
  }

  //Inicializa o conjunto de workers
  initWorkers() {
    const workerPath = path.join(__dirname, 'computeWorker.js');

    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = fork(workerPath);

      worker.on('message', (message) => {
        this.handleWorkerMessage(worker, message);
      });

      worker.on('exit', (code, signal) => {
        console.error(`Worker ${worker.pid} saiu com código ${code} e sinal ${signal}`);
        this.restartWorker(worker);
      });

      worker.on('error', (error) => {
        console.error(`Erro do worker ${worker.pid}:`, error);
      });

      this.workers.push({
        worker,
        busy: false,
        id: i
      });
    }
  }

  //Reinicia um worker que terminou
  restartWorker(oldWorker) {
    const index = this.workers.findIndex(w => w.worker === oldWorker);
    if (index === -1) return;

    const workerPath = path.join(__dirname, 'computeWorker.js');
    const newWorker = fork(workerPath);

    newWorker.on('message', (message) => {
      this.handleWorkerMessage(newWorker, message);
    });

    newWorker.on('exit', (code, signal) => {
      console.error(`Worker ${newWorker.pid} saiu. A reiniciar...`);
      this.restartWorker(newWorker);
    });

    newWorker.on('error', (error) => {
      console.error(`Erro do worker ${newWorker.pid}:`, error);
    });

    this.workers[index] = {
      worker: newWorker,
      busy: false,
      id: this.workers[index].id
    };
  }

  //Trata mensagem do worker
  handleWorkerMessage(worker, message) {
    if (message.ready) {
      // Worker está pronto, marca como disponível
      const workerInfo = this.workers.find(w => w.worker === worker);
      if (workerInfo) {
        workerInfo.busy = false;
        this.processQueue();
      }
      return;
    }

    // Encontra a tarefa e resolve/rejeita a promessa
    const workerInfo = this.workers.find(w => w.worker === worker);
    if (workerInfo) {
      workerInfo.busy = false;
    }

    const task = this.activeTasks.get(message.taskId);
    if (task) {
      this.activeTasks.delete(message.taskId);
      if (message.success) {
        task.resolve(message);
      } else {
        task.reject(new Error(message.error || 'Tarefa falhou'));
      }
    }

    // Processa próxima tarefa na fila
    this.processQueue();
  }

  //Processa próxima tarefa na fila
  processQueue() {
    if (this.taskQueue.length === 0) return;

    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) return;

    const task = this.taskQueue.shift();
    availableWorker.busy = true;

    const taskId = ++this.taskIdCounter;
    this.activeTasks.set(taskId, task);

    availableWorker.worker.send({
      ...task.message,
      taskId
    });
  }

  //Executa uma tarefa intensiva de CPU
  async executeTask(task, data) {
    return new Promise((resolve, reject) => {
      const taskInfo = {
        message: { task, data },
        resolve,
        reject
      };

      const availableWorker = this.workers.find(w => !w.busy);
      
      if (availableWorker) {
        availableWorker.busy = true;
        const taskId = ++this.taskIdCounter;
        this.activeTasks.set(taskId, taskInfo);
        
        availableWorker.worker.send({
          task,
          data,
          taskId
        });
      } else {
        //Adiciona à fila se todos os workers estiverem ocupados
        this.taskQueue.push(taskInfo);
      }
    });
  }

  //Obtém estatísticas dos workers
  getStats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.busy).length,
      availableWorkers: this.workers.filter(w => !w.busy).length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size
    };
  }

  //Encerra todos os workers graciosamente
  async shutdown() {
    // Espera que tarefas ativas terminem
    const activePromises = Array.from(this.activeTasks.values()).map(t => 
      Promise.race([t.promise, new Promise(resolve => setTimeout(resolve, 5000))])
    );
    await Promise.all(activePromises);

    // Mata todos os workers
    const killPromises = this.workers.map(({ worker }) => {
      return new Promise((resolve) => {
        worker.once('exit', resolve);
        worker.kill('SIGTERM');
      });
    });

    await Promise.all(killPromises);
  }
}

export default ProcessManager;