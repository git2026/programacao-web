#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
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

// Detect platform
const isWindows = process.platform === 'win32';

// Configuration
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

// Check if dev mode is enabled
const isDevMode = process.argv.includes('--dev');

// Logging functions
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

// Check if directories exist
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

// Start a process
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
      shell: false  // Não usar shell para evitar aviso de segurança
    });
    
    let started = false;
    let outputBuffer = '';
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      
      // Limpar spinner e mostrar output quando recebemos dados
      if (!started) {
        clearInterval(spinnerInterval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Limpar linha do spinner
      }
      
      // Verificar conclusão do arranque
      if (!started) {
        if (name === 'Frontend' && (output.includes('Local:') || output.includes('ready in'))) {
          started = true;
          logSuccess(`${name} pronto!`, color);
          resolve({ process, started: true });
        } else if (name === 'Backend' && output.includes('Server running')) {
          started = true;
          logSuccess(`${name} pronto!`, color);
          resolve({ process, started: true });
        }
      }
      
      // Registar output com cor e melhor formatação
      const lines = output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        // Saltar linhas de output do npm e mostrar mensagens mais limpas
        if (line.includes('> ') && line.includes('@')) {
          return; // Saltar linhas de comando npm
        }
        if (line.includes('npm') && line.includes('start')) {
          return; // Saltar linhas npm start
        }
        if (line.includes('vite') && line.includes('node_modules')) {
          return; // Saltar linha do vite
        }
        
        // Formatar diferentes tipos de output
        if (line.includes('ready in')) {
          log(`[${name}] ⚡ ${line}`, color);
        } else if (line.includes('Local:')) {
          log(`[${name}] 🌐 ${line}`, color);
        } else if (line.includes('Server running')) {
          log(`[${name}] 🚀 ${line}`, color);
        } else if (line.includes('Environment:')) {
          log(`[${name}] 📝 ${line}`, color);
        } else if (line.trim() && !line.includes('node_modules')) {
          log(`[${name}] ${line}`, color);
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
    
    // Timeout após 30 segundos
    setTimeout(() => {
      if (!started) {
        clearInterval(spinnerInterval);
        logWarning(`${name} está a demorar mais do que o esperado a iniciar...`);
      }
    }, 30000);
  });
}

// Instalar dependências se necessário
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
      // Mostrar progresso
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

// Função principal de arranque
async function startApplication() {
  // Limpar ecrã e mostrar banner
  console.clear();
  logBanner(' Developer Portfolio Full-Stack', colors.cyan);
  log('');
  
  // Verificar diretórios
  checkDirectories();
  
  // Verificar se node_modules existem
  const frontendNodeModules = existsSync(join(config.frontend.path, 'node_modules'));
  const backendNodeModules = existsSync(join(config.backend.path, 'node_modules'));
  
  // Auto-instalar dependências se em falta
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
    // Iniciar ambos os processos concorrentemente
    const [frontendResult, backendResult] = await Promise.allSettled([
      startProcess('Frontend', config.frontend, colors.green),
      startProcess('Backend', config.backend, colors.blue)
    ]);
    
    // Verificar resultados
    const frontendSuccess = frontendResult.status === 'fulfilled';
    const backendSuccess = backendResult.status === 'fulfilled';
    
    if (frontendSuccess && backendSuccess) {
      logBanner('✅ Tudo pronto', colors.green);
      
      // Application URLs box
      logBox('📱 URLs', [
        `Frontend:   http://localhost:${config.frontend.port}`,
        `Backend:    http://localhost:${config.backend.port}`,
        `API Tester: http://localhost:${config.backend.port}/api-tester.html`
      ], colors.white);
      
      log(`${colors.dim}Ctrl+C para parar${colors.reset}`);
      
      // Manter o processo ativo
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
      
      // Manter o processo principal ativo
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

// Tratar exceções não capturadas
process.on('uncaughtException', (error) => {
  logError(`Exceção não capturada: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Rejeição não tratada: ${reason?.message || reason}`);
  process.exit(1);
});

// Iniciar a aplicação
startApplication();