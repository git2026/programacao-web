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
  const banner = '═'.repeat(text.length + 4);
  log(`╔${banner}╗`, color);
  log(`║  ${text}  ║`, color);
  log(`╚${banner}╝`, color);
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
    logError(`Frontend directory not found: ${config.frontend.path}`);
    process.exit(1);
  }
  
  if (!backendExists) {
    logError(`Backend directory not found: ${config.backend.path}`);
    process.exit(1);
  }
  
  return { frontendExists, backendExists };
}

// Start a process
function startProcess(name, config, color) {
  return new Promise((resolve, reject) => {
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let spinnerIndex = 0;
    
    log(`[${name}] ${spinner[spinnerIndex]} Starting ${name}...`, color);
    
    const spinnerInterval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
      process.stdout.write(`\r[${name}] ${spinner[spinnerIndex]} Starting ${name}...`);
    }, 100);
    
    const process = spawn(config.command, config.args, {
      cwd: config.path,
      stdio: 'pipe',
      shell: false  // Fixed: Don't use shell to avoid security warning
    });
    
    let started = false;
    let outputBuffer = '';
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      
      // Clear spinner and show output when we get data
      if (!started) {
        clearInterval(spinnerInterval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear spinner line
      }
      
      // Check for startup completion
      if (!started) {
        if (name === 'Frontend' && (output.includes('Local:') || output.includes('ready in'))) {
          started = true;
          logSuccess(`✅ ${name} started successfully!`, color);
          resolve({ process, started: true });
        } else if (name === 'Backend' && output.includes('Server running')) {
          started = true;
          logSuccess(`✅ ${name} started successfully!`, color);
          resolve({ process, started: true });
        }
      }
      
      // Log output with color and better formatting
      const lines = output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        // Skip npm output lines and show cleaner messages
        if (line.includes('> ') && line.includes('@')) {
          return; // Skip npm command lines
        }
        if (line.includes('npm') && line.includes('start')) {
          return; // Skip npm start lines
        }
        
        // Format different types of output
        if (line.includes('ready in')) {
          log(`[${name}] ⚡ ${line}`, color);
        } else if (line.includes('Local:')) {
          log(`[${name}] 🌐 ${line}`, color);
        } else if (line.includes('Server running')) {
          log(`[${name}] 🚀 ${line}`, color);
        } else if (line.includes('Environment:')) {
          log(`[${name}] 📝 ${line}`, color);
        } else {
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
        logError(`${name} exited with code ${code}`);
        reject(new Error(`${name} failed to start`));
      }
    });
    
    process.on('error', (error) => {
      clearInterval(spinnerInterval);
      logError(`Failed to start ${name}: ${error.message}`);
      reject(error);
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        clearInterval(spinnerInterval);
        logWarning(`${name} is taking longer than expected to start...`);
      }
    }, 30000);
  });
}

// Install dependencies if needed
async function installDependencies(name, path) {
  return new Promise((resolve, reject) => {
    logInfo(`Installing ${name} dependencies...`);
    
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
      // Show progress
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
        logSuccess(`${name} dependencies installed successfully!`);
        resolve();
      } else {
        logError(`Failed to install ${name} dependencies`);
        reject(new Error(`npm install failed for ${name}`));
      }
    });
    
    npmInstall.on('error', (error) => {
      logError(`Failed to run npm install for ${name}: ${error.message}`);
      reject(error);
    });
  });
}

// Main startup function
async function startApplication() {
  // Clear screen and show banner
  console.clear();
  logBanner('🚀 Developer Portfolio Full-Stack', colors.cyan);
  log('');
  
  // Check directories
  checkDirectories();
  
  // Check if node_modules exist
  const frontendNodeModules = existsSync(join(config.frontend.path, 'node_modules'));
  const backendNodeModules = existsSync(join(config.backend.path, 'node_modules'));
  
  // Auto-install dependencies if missing
  if (!frontendNodeModules || !backendNodeModules) {
    logBox('📦 First-Time Setup Detected', [
      'Installing dependencies automatically...',
      'This may take a few minutes on first run.'
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
      
      logSuccess('All dependencies installed successfully!');
      log('');
    } catch (error) {
      logBox('❌ Installation Failed', [
        `Error: ${error.message}`,
        '',
        'Please install manually:',
        'cd frontend && npm install',
        'cd backend && npm install'
      ], colors.red);
      log('');
      process.exit(1);
    }
  }
  
  try {
    // Start both processes concurrently
    const [frontendResult, backendResult] = await Promise.allSettled([
      startProcess('Frontend', config.frontend, colors.green),
      startProcess('Backend', config.backend, colors.blue)
    ]);
    
    // Check results
    const frontendSuccess = frontendResult.status === 'fulfilled';
    const backendSuccess = backendResult.status === 'fulfilled';
    
    if (frontendSuccess && backendSuccess) {
      log('');
      logBanner('🎉 Services Started Successfully!', colors.green);
      log('');
      
      // Application URLs box
      logBox('📱 Application URLs', [
        `Frontend:   http://localhost:${config.frontend.port}`,
        `Backend:    http://localhost:${config.backend.port}`,
        `API Tester: http://localhost:${config.backend.port}/api-tester.html`
      ], colors.white);
      log('');
      
      log(`${colors.dim}   Press Ctrl+C to stop all services${colors.reset}`);
      log('');
      
      // Keep the process alive
      process.on('SIGINT', () => {
        log('');
        logBox('🛑 Shutting Down', [
          'Stopping all services...',
          'Thank you for using Developer Portfolio! 👋'
        ], colors.yellow);
        
        if (frontendSuccess) {
          frontendResult.value.process.kill();
        }
        if (backendSuccess) {
          backendResult.value.process.kill();
        }
        
        log('');
        logSuccess('All services stopped successfully!');
        process.exit(0);
      });
      
      // Keep the main process alive
      process.stdin.resume();
      
    } else {
      log('');
      logBox('❌ Startup Failed', [
        'Failed to start one or more services',
        '',
        !frontendSuccess ? `Frontend error: ${frontendResult.reason}` : '',
        !backendSuccess ? `Backend error: ${backendResult.reason}` : ''
      ].filter(Boolean), colors.red);
      log('');
      process.exit(1);
    }
    
  } catch (error) {
    log('');
    logBox('💥 Critical Error', [
      `Startup failed: ${error.message}`,
      '',
      'Please check your configuration and try again.'
    ], colors.red);
    log('');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start the application
startApplication();
