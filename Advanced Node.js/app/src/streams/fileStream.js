// Utilitários para streaming de ficheiros

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');

// Cria um stream de leitura a partir de um ficheiro
export function createReadStream(filePath, options = {}) {
  const fullPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(UPLOAD_DIR, filePath);
  
  return fs.createReadStream(fullPath, {
    highWaterMark: 64 * 1024, // Chunks de 64KB
    ...options
  });
}

// Cria um stream de escrita para um ficheiro
export function createWriteStream(filePath, options = {}) {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(UPLOAD_DIR, filePath);

  // Garante que o diretório existe
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return fs.createWriteStream(fullPath, {
    highWaterMark: 64 * 1024, // Chunks de 64KB
    ...options
  });
}

// Obtém o caminho do diretório de uploads
export function getUploadDir() {
  return UPLOAD_DIR;
}

// Garante que o diretório de uploads existe
export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export default {
  createReadStream,
  createWriteStream,
  getUploadDir,
  ensureUploadDir
};