// Rota de processamento intensivo de CPU usando processos filhos
import ProcessManager from '../processes/processManager.js';

// Cria uma instância do gestor de processos (partilhada entre pedidos)
let processManager = null;

function getProcessManager() {
  if (!processManager) {
    processManager = new ProcessManager(4); // 4 workers
  }
  return processManager;
}

// Processa pedido de computação intensiva de CPU
export async function handleProcess(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const task = url.searchParams.get('task') || 'heavyComputation';
  const data = {};

  // Analisa parâmetros específicos da tarefa
  if (task === 'heavyComputation') {
    const n = parseInt(url.searchParams.get('n') || '10000000', 10);
    data.n = n;
  } else if (task === 'processArray') {
    const size = parseInt(url.searchParams.get('size') || '1000', 10);
    data.numbers = Array.from({ length: size }, (_, i) => i * 10);
  } else if (task === 'generatePrimes') {
    const limit = parseInt(url.searchParams.get('limit') || '1000', 10);
    data.limit = limit;
  }

  const pm = getProcessManager();

  try {
    const startTime = Date.now();
    const result = await pm.executeTask(task, data);
    const totalDuration = Date.now() - startTime;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      task,
      workerDuration: result.duration,
      totalDuration,
      result: typeof result.result === 'number' 
        ? result.result 
        : Array.isArray(result.result)
        ? { count: result.result.length, sample: result.result.slice(0, 10) }
        : result.result,
      workerPid: 'N/A' // Poderia rastrear isto se necessário
    }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
}

// Processa computação paralela (múltiplos workers)
export async function handleParallelProcess(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const count = parseInt(url.searchParams.get('count') || '4', 10);
  const n = parseInt(url.searchParams.get('n') || '5000000', 10);

  const pm = getProcessManager();

  try {
    const startTime = Date.now();
    
    // Executa tarefas em paralelo
    const promises = Array.from({ length: count }, () => 
      pm.executeTask('heavyComputation', { n })
    );

    const results = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    const sum = results.reduce((acc, r) => acc + (r.result || 0), 0);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      task: 'parallelComputation',
      workersUsed: count,
      totalDuration,
      averageWorkerDuration: results.reduce((acc, r) => acc + r.duration, 0) / results.length,
      combinedResult: sum,
      individualResults: results.map(r => ({
        duration: r.duration,
        result: r.result
      }))
    }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
}

// Obtém estatísticas do gestor de processos
export function handleProcessStats(req, res) {
  const pm = getProcessManager();
  const stats = pm.getStats();

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    stats
  }));
}

export default {
  handleProcess,
  handleParallelProcess,
  handleProcessStats
};
