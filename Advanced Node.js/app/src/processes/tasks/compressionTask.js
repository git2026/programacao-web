/**
 * Tarefa de compressão usando processo filho
 * Demonstra o uso de spawn para comandos externos
 */

import { spawn } from 'child_process';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import zlib from 'zlib';

/**
 * Comprime ficheiro usando gzip via spawn
 */
export function compressWithSpawn(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Verifica se gzip está disponível (dependendo do sistema operativo)
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Usa zlib do Node (Windows)
      const readStream = fs.createReadStream(inputPath);
      const gzipStream = zlib.createGzip();
      const writeStream = fs.createWriteStream(outputPath);

      pipeline(readStream, gzipStream, writeStream)
        .then(() => resolve({ success: true, outputPath }))
        .catch(reject);
    } else {
      // Usa comando gzip do sistema (Unix-like) via spawn
      const gzip = spawn('gzip', ['-c'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const readStream = fs.createReadStream(inputPath);
      const writeStream = fs.createWriteStream(outputPath);

      readStream.pipe(gzip.stdin);
      gzip.stdout.pipe(writeStream);

      let errorOutput = '';
      gzip.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      gzip.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, outputPath });
        } else {
          reject(new Error(`gzip saiu com código ${code}: ${errorOutput}`));
        }
      });

      gzip.on('error', (error) => {
        reject(error);
      });

      readStream.on('error', reject);
      writeStream.on('error', reject);
    }
  });
}

export default {
  compressWithSpawn
};