// Utilitário simples de logging com suporte para ID de worker

export class Logger {
  constructor(workerId = null) {
    this.workerId = workerId;
    this.prefix = workerId ? `[Worker ${workerId}]` : '[Master]';
  }

  log(...args) {
    console.log(`${this.prefix}`, ...args);
  }

  error(...args) {
    console.error(`${this.prefix} [ERROR]`, ...args);
  }

  info(...args) {
    console.log(`${this.prefix} [INFO]`, ...args);
  }

  warn(...args) {
    console.warn(`${this.prefix} [WARN]`, ...args);
  }
}

export default Logger;