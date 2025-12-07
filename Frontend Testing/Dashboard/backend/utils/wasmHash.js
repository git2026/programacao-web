/** Utilitários de Hash de Passwords com WebAssembly */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let wasmInstance = null;
let memoryOffset = 1024;

// Carregar e inicializar módulo WebAssembly
async function loadWasmModule() {
  if (wasmInstance) {
    memoryOffset = 1024;
    return wasmInstance;
  }

  try {
    const wasmPath = join(__dirname, '../wasm/build/password_hash.wasm');
    
    // Verificar se o ficheiro existe
    if (!existsSync(wasmPath)) {
      throw new Error(`Ficheiro WASM não encontrado: ${wasmPath}`);
    }
    
    const wasmBytes = readFileSync(wasmPath);
    const wasmModule = await WebAssembly.compile(wasmBytes);
    
    // Stubs WASI mínimos (módulo cdylib não precisa de _start)
    const wasiImports = {
      wasi_snapshot_preview1: {
        proc_exit: () => {},
        fd_close: () => 0,
        fd_seek: () => 0,
        fd_write: () => 0,
        fd_read: () => 0,
        environ_sizes_get: () => 0,
        environ_get: () => 0,
        args_sizes_get: () => 0,
        args_get: () => 0,
        clock_time_get: () => 0,
        random_get: () => 0,
      }
    };

    try {
      wasmInstance = await WebAssembly.instantiate(wasmModule, wasiImports);
    } catch (error) {
      try {
        wasmInstance = await WebAssembly.instantiate(wasmModule, {});
      } catch (e2) {
        throw new Error(`Falha ao instanciar WASM: ${error.message}`);
      }
    }

    if (!wasmInstance.exports.memory) {
      const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });
      wasmInstance = await WebAssembly.instantiate(wasmModule, {
        ...wasiImports,
        env: { memory }
      });
    }
    
    if (!wasmInstance.exports.hash_password || !wasmInstance.exports.get_output_buffer || !wasmInstance.exports.verify_password) {
      throw new Error('Funções WASM necessárias não encontradas');
    }
    
    memoryOffset = 1024;
    return wasmInstance;
  } catch (error) {
    console.error('[Backend] Erro ao carregar modulo WASM:', error.message);
    throw error;
  }
}

// Escrever string na memória WASM
function writeStringToMemory(instance, str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const memory = new Uint8Array(instance.exports.memory.buffer);
  const ptr = memoryOffset;
  
  memoryOffset += bytes.length + 1;
  
  if (ptr + bytes.length > memory.length) {
    memoryOffset = 1024;
    throw new Error('Memória WASM insuficiente');
  }
  
  memory.set(bytes, ptr);
  memory[ptr + bytes.length] = 0;
  return { ptr, len: bytes.length };
}

// Gerar salt aleatório
function generateSalt(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Gera hash de password usando WebAssembly (SHA-512, 10.000 iterações)
 * Fallback para crypto nativo se WASM não estiver disponível
 * @param {string} password - Password a fazer hash
 * @param {string|null} salt - Salt opcional (gerado automaticamente se não fornecido)
 * @returns {Promise<string>} Hash formatado ($wasm$ ou $fallback$)
 */
export async function hashPassword(password, salt = null) {
  try {
    const instance = await loadWasmModule();

    if (!salt) {
      salt = generateSalt(16);
    }

    const passwordData = writeStringToMemory(instance, password);
    const saltData = writeStringToMemory(instance, salt);

    const hashLen = instance.exports.hash_password(
      passwordData.ptr,
      passwordData.len,
      saltData.ptr,
      saltData.len
    );

    if (hashLen === 0) {
      throw new Error('Falha ao calcular hash');
    }

    const outputPtr = instance.exports.get_output_buffer();
    const memory = new Uint8Array(instance.exports.memory.buffer);
    const hashBytes = memory.slice(outputPtr, outputPtr + hashLen);
    const hash = new TextDecoder().decode(hashBytes);

    return `$wasm$${Buffer.from(salt).toString('base64')}$${hash}`;
  } catch (error) {
    const crypto = await import('crypto');
    
    if (!salt) {
      salt = generateSalt(16);
    }
    
    // SHA-512 com salt
    const hash = crypto.createHash('sha512')
      .update(password + salt)
      .digest('hex');
    
    return `$fallback$${Buffer.from(salt).toString('base64')}$${hash}`;
  }
}

/**
 * Verifica password comparando com hash armazenado
 * Suporta hashes WASM e fallback
 * @param {string} password - Password a verificar
 * @param {string} hashString - Hash armazenado
 * @returns {Promise<boolean>} true se password corresponde
 */
export async function verifyPassword(password, hashString) {
  try {
    // Verificar se é hash WASM
    if (hashString.startsWith('$wasm$')) {
      try {
        const parts = hashString.substring(6).split('$');
        if (parts.length !== 2) {
          return false;
        }

        const salt = Buffer.from(parts[0], 'base64').toString('utf-8');
        const expectedHash = parts[1];

        const instance = await loadWasmModule();
        const passwordData = writeStringToMemory(instance, password);
        const hashData = writeStringToMemory(instance, expectedHash);
        const saltData = writeStringToMemory(instance, salt);

        const result = instance.exports.verify_password(
          passwordData.ptr,
          passwordData.len,
          hashData.ptr,
          hashData.len,
          saltData.ptr,
          saltData.len
        );

        return result === 1;
      } catch (error) {
        return false;
      }
    }
    
    // Verificar se é hash fallback
    if (hashString.startsWith('$fallback$')) {
      const crypto = await import('crypto');
      const parts = hashString.substring(10).split('$');
      if (parts.length !== 2) {
        return false;
      }
      
      const salt = Buffer.from(parts[0], 'base64').toString('utf-8');
      const expectedHash = parts[1];
      
      const hash = crypto.createHash('sha512')
        .update(password + salt)
        .digest('hex');
      
      return hash === expectedHash;
    }
    
    return false;
  } catch (error) {
    console.error('[Backend] Erro ao verificar password:', error);
    return false;
  }
}