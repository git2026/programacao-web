/**
 * Tarefa de processamento de dados intensivo de CPU
 * Executa num processo filho para evitar bloquear o loop de eventos
 */

//Computação pesada: soma de números
export function heavyComputation(n) {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += i;
  }
  return total;
}

//Processa array de números (intensivo de CPU)
export function processArray(numbers) {
  const results = numbers.map(num => {
    let result = 0;
    for (let i = 0; i < num; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    return result;
  });
  return results;
}

//Gera números primos até n (intensivo de CPU)
export function generatePrimes(limit) {
  const primes = [];
  const isPrime = new Array(limit + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  for (let i = 2; i * i <= limit; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= limit; j += i) {
        isPrime[j] = false;
      }
    }
  }

  for (let i = 2; i <= limit; i++) {
    if (isPrime[i]) {
      primes.push(i);
    }
  }

  return primes;
}

// Trata mensagens do processo pai
if (import.meta.url === `file://${process.argv[1]}`) {
  process.on('message', (message) => {
    const { task, data } = message;

    try {
      let result;
      const startTime = Date.now();

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

      process.send({
        success: true,
        result,
        duration,
        task
      });
    } catch (error) {
      process.send({
        success: false,
        error: error.message,
        task
      });
    }
  });
}

export default {
  heavyComputation,
  processArray,
  generatePrimes
};
