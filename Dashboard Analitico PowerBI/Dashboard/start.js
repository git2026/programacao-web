import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import http from 'http';

// Caminhos de arquivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para log
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m'
};

// Verifica se o sistema é Windows
const isWindows = process.platform === 'win32';

// Configuração dos serviços (frontend e backend)
const config = {
  frontend: {
    port: 5173,
    path: join(__dirname, 'frontend'),
    command: isWindows ? 'cmd' : 'npm',
    args: isWindows ? ['/c', 'npm', 'start'] : ['start']
  },
  backend: {
    port: 5000,
    path: join(__dirname, 'backend'),
    command: isWindows ? 'cmd' : 'npm',
    args: isWindows ? ['/c', 'npm', 'start'] : ['start']
  }
};

// Função para log
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Função para log de sucesso
function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

// Função para log de erro
function logError(message) {
  log(`❌ ${message}`, colors.red);
}

// Função para log de informação
function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Função para log de aviso
function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Função para log de banner
function logBanner(text, color = colors.cyan) {
  log(`\n${text}\n`, color);
}

// Função para log de box
function logBox(title, content, color = colors.white) {
  const width = Math.max(title.length, ...content.map(line => line.length)) + 4;
  const topBorder = '┌' + '─'.repeat(width - 2) + '┐';
  const bottomBorder = '└' + '─'.repeat(width - 2) + '┘';
  
  log(topBorder, color);
  log(`│ ${title.padEnd(width - 3)}│`, color);
  log('├' + '─'.repeat(width - 2) + '┤', color);
  content.forEach(line => {
    log(`│ ${line.padEnd(width - 3)}│`, color);
  });
  log(bottomBorder, color);
}

// Função para log de URL
function logUrl(label, url, color) {
  log(`   ${label.padEnd(12)} ${color}${url}${colors.reset}`);
}

// Função para verificar diretórios
function checkDirectories() {
  const frontendExists = existsSync(config.frontend.path);
  const backendExists = existsSync(config.backend.path);
  
  if (!frontendExists) {
    logError(`Diretório do frontend não encontrado: ${config.frontend.path}`);
    process.exit(1);
  }
  
  if (!backendExists) {
    logError(`Diretório do backend não encontrado: ${config.backend.path}`);
    process.exit(1);
  }
  
  return { frontendExists, backendExists };
}

// Função para verificar saúde usando HTTP nativo
function checkHealth(port, path = '/', maxAttempts = 30, interval = 1000) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const tryConnect = () => {
      attempts++;
      
      const req = http.get(`http://localhost:${port}${path}`, { timeout: 2000 }, (res) => {
        req.destroy();
        resolve(true);
      });
      
      req.on('error', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          resolve(false);
        } else {
          setTimeout(tryConnect, interval);
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          resolve(false);
        } else {
          setTimeout(tryConnect, interval);
        }
      });
    };
    
    tryConnect();
  });
}

// Função para iniciar processo
function startProcess(name, config, color) {
  return new Promise((resolve, reject) => {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;
    
    log(`${spinner[spinnerIndex]} A iniciar ${name}...`, color);
    
    const spinnerInterval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
      process.stdout.write(`\r${spinner[spinnerIndex]} A iniciar ${name}...`);
    }, 100);
    
    const childProcess = spawn(config.command, config.args, {
      cwd: config.path,
      stdio: 'pipe',
      shell: false
    });
    
    let started = false;
    let healthCheckStarted = false;
    
    // Iniciar health check após um pequeno delay
    setTimeout(async () => {
      if (started) return;
      
      healthCheckStarted = true;
      const healthPath = name === 'Backend' ? '/' : '/';
      
      const isHealthy = await checkHealth(config.port, healthPath);
      
      if (isHealthy && !started) {
        started = true;
        clearInterval(spinnerInterval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
        logSuccess(`${name} pronto`, color);
        resolve({ process: childProcess, started: true });
      } else if (!isHealthy && !started) {
        clearInterval(spinnerInterval);
        logError(`${name} não respondeu ao health check`);
        reject(new Error(`${name} falhou ao iniciar`));
      }
    }, 2000);
    
    // Capturar output do processo (silencioso - apenas erros críticos)
    childProcess.stdout.on('data', () => {
      // Não mostrar output normal - apenas verificar via health check
    });
    
    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      const trimmed = output.trim();
      // Apenas mostrar erros críticos (não warnings do npm/vite)
      if (trimmed && 
          !trimmed.includes('node_modules') && 
          !trimmed.includes('npm') &&
          !trimmed.includes('vite') &&
          (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal'))) {
        log(`[${name}] ${trimmed}`, colors.red);
      }
    });
    
    childProcess.on('close', (code) => {
      clearInterval(spinnerInterval);
      if (code !== 0 && !started) {
        logError(`${name} terminou com código ${code}`);
        reject(new Error(`${name} falhou ao iniciar`));
      }
    });
    
    childProcess.on('error', (error) => {
      clearInterval(spinnerInterval);
      logError(`Falha ao iniciar ${name}: ${error.message}`);
      reject(error);
    });
    
    // Timeout de segurança (apenas se health check não iniciou)
    setTimeout(() => {
      if (!started && !healthCheckStarted) {
        clearInterval(spinnerInterval);
        logWarning(`${name} está a demorar mais do que o esperado...`);
      }
    }, 35000);
  });
}

// Função para instalar dependências
async function installDependencies(name, path) {
  return new Promise((resolve, reject) => {
    logInfo(`A instalar dependências do ${name}...`);
    
    const command = isWindows ? 'cmd' : 'npm';
    const args = isWindows ? ['/c', 'npm', 'install'] : ['install'];
    
    const npmInstall = spawn(command, args, {
      cwd: path,
      stdio: 'pipe',
      shell: false
    });
    
    let outputBuffer = '';
    
    npmInstall.stdout.on('data', (data) => {
      outputBuffer += data.toString();
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('added') || line.includes('packages')) {
          log(`[${name}] ${line}`, colors.dim);
        }
      });
    });
    
    npmInstall.stderr.on('data', (data) => {
      log(`[${name}] ${data.toString()}`, colors.yellow);
    });
    
    npmInstall.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${name}: dependências instaladas!`);
        resolve();
      } else {
        logError(`Falha ao instalar dependências do ${name}`);
        reject(new Error(`npm install falhou para ${name}`));
      }
    });
    
    npmInstall.on('error', (error) => {
      logError(`Falha ao executar npm install para ${name}: ${error.message}`);
      reject(error);
    });
  });
}

// Função para iniciar aplicação
async function startApplication() {
  console.clear();
  logBanner('Dashboard PowerBI Full-Stack', colors.cyan);
  log('');
  
  checkDirectories();
  
  // Verifica se as dependências estão instaladas
  const frontendNodeModules = existsSync(join(config.frontend.path, 'node_modules'));
  const backendNodeModules = existsSync(join(config.backend.path, 'node_modules'));
  
  if (!frontendNodeModules || !backendNodeModules) {
    logBox('📦 Primeira Execução', [
      'A instalar dependências...',
      'Pode demorar alguns minutos.'
    ], colors.cyan);
    log('');
    
    try {
      if (!frontendNodeModules) {
        await installDependencies('Frontend', config.frontend.path);
        log('');
      }
      
      if (!backendNodeModules) {
        await installDependencies('Backend', config.backend.path);
        log('');
      }
      
      logSuccess('Dependências instaladas!');
      log('');
    } catch (error) {
      logBox('❌ Erro na Instalação', [
        `Erro: ${error.message}`,
        '',
        'Instale manualmente:',
        'cd frontend && npm install',
        'cd backend && npm install'
      ], colors.red);
      log('');
      process.exit(1);
    }
  }
  
  try {
    // Inicia frontend e backend em paralelo
    const [frontendResult, backendResult] = await Promise.allSettled([
      startProcess('Frontend', config.frontend, colors.green),
      startProcess('Backend', config.backend, colors.blue)
    ]);
    
    const frontendSuccess = frontendResult.status === 'fulfilled';
    const backendSuccess = backendResult.status === 'fulfilled';
    
    if (frontendSuccess && backendSuccess) {
      logBanner('✅ Tudo pronto', colors.green);
      
      logBox('📱 URLs', [
        `Frontend:   http://localhost:${config.frontend.port}`,
        `Backend:    http://localhost:${config.backend.port}`,
        `API Tester: http://localhost:${config.backend.port}/api-tester.html`
      ], colors.white);
      
      log(`${colors.dim}Ctrl+C para parar${colors.reset}`);
      
      // Handler para encerramento gracioso
      process.on('SIGINT', () => {
        logBox('🛑 A Encerrar', [
          'A parar serviços...',
          'Até breve! 👋'
        ], colors.yellow);
        
        if (frontendSuccess) {
          frontendResult.value.process.kill();
        }
        if (backendSuccess) {
          backendResult.value.process.kill();
        }
        
        log('');
        logSuccess('Serviços parados!');
        process.exit(0);
      });
      
      process.stdin.resume();
      
    } else {
      log('');
      logBox('❌ Erro ao Iniciar', [
        'Não foi possível iniciar os serviços',
        '',
        !frontendSuccess ? `Frontend: ${frontendResult.reason}` : '',
        !backendSuccess ? `Backend: ${backendResult.reason}` : ''
      ].filter(Boolean), colors.red);
      log('');
      process.exit(1);
    }
    
  } catch (error) {
    log('');
    logBox('💥 Erro', [
      `${error.message}`,
      '',
      'Verifique a configuração e tente novamente.'
    ], colors.red);
    log('');
    process.exit(1);
  }
}

// Handlers de erro globais (exceções não tratadas e rejeições de promessas)
process.on('uncaughtException', (error) => {
  logError(`Exceção não capturada: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Rejeição não tratada: ${reason?.message || reason}`);
  process.exit(1);
});

startApplication();