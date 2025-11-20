#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const isWindows = process.platform === 'win32';

// Configuração dos serviços
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

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logBanner(text, color = colors.cyan) {
  log(`\n${text}\n`, color);
}

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

function logUrl(label, url, color) {
  log(`   ${label.padEnd(12)} ${color}${url}${colors.reset}`);
}

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

function startProcess(name, config, color) {
  return new Promise((resolve, reject) => {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;
    
    log(`[${name}] ${spinner[spinnerIndex]} A iniciar ${name}...`, color);
    
    const spinnerInterval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
      process.stdout.write(`\r[${name}] ${spinner[spinnerIndex]} A iniciar ${name}...`);
    }, 100);
    
    const process = spawn(config.command, config.args, {
      cwd: config.path,
      stdio: 'pipe',
      shell: false
    });
    
    let started = false;
    let outputBuffer = '';
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      
      if (!started) {
        clearInterval(spinnerInterval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
      }
      
      // Deteta quando o processo está pronto através de mensagens específicas
      if (!started) {
        if (name === 'Frontend' && (output.includes('Local:') || output.includes('ready in'))) {
          started = true;
          logSuccess(`${name} pronto!`, color);
          resolve({ process, started: true });
        } else if (name === 'Backend' && output.includes('Servidor em execução')) {
          started = true;
          logSuccess(`${name} pronto!`, color);
          resolve({ process, started: true });
        }
      }
      
      // Filtra output desnecessário (comandos npm, vite, mensagens de arranque)
      const lines = output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('> ') && line.includes('@')) return;
        if (line.includes('npm') && line.includes('start')) return;
        if (line.includes('vite') && line.includes('node_modules')) return;
        if (line.includes('ready in') || line.includes('Local:') || line.includes('Servidor em execução')) return;
        
        if (line.trim() && !line.includes('node_modules')) {
          console.log(line);
        }
      });
    });
    
    process.stderr.on('data', (data) => {
      const output = data.toString();
      log(`[${name}] ${output}`, colors.red);
    });
    
    process.on('close', (code) => {
      clearInterval(spinnerInterval);
      if (code !== 0) {
        logError(`${name} terminou com código ${code}`);
        reject(new Error(`${name} falhou ao iniciar`));
      }
    });
    
    process.on('error', (error) => {
      clearInterval(spinnerInterval);
      logError(`Falha ao iniciar ${name}: ${error.message}`);
      reject(error);
    });
    
    // Timeout de segurança: avisa se o processo demorar mais de 30 segundos
    setTimeout(() => {
      if (!started) {
        clearInterval(spinnerInterval);
        logWarning(`${name} está a demorar mais do que o esperado a iniciar...`);
      }
    }, 30000);
  });
}

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

async function startApplication() {
  console.clear();
  logBanner(' Developer Portfolio Full-Stack', colors.cyan);
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
      
      // Handler para encerramento gracioso (Ctrl+C)
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

// Handlers de erro globais
process.on('uncaughtException', (error) => {
  logError(`Exceção não capturada: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Rejeição não tratada: ${reason?.message || reason}`);
  process.exit(1);
});

startApplication();