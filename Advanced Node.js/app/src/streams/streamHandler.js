// Utilitários de orquestração e pipeline de streams

import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from './fileStream.js';
import { UppercaseTransform, LineCounterTransform } from './transformStream.js';
import zlib from 'zlib';

// Trata erros de streams
function handleStreamError(stream, errorHandler) {
  stream.on('error', (error) => {
    errorHandler(error);
  });
}

// Copia ficheiro usando streams com transformação opcional
export async function copyFileWithTransform(
  inputPath, 
  outputPath, 
  transform = null,
  options = {}
) {
  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);
  
  const streams = [readStream];
  
  if (transform) {
    streams.push(transform);
  }
  
  streams.push(writeStream);

  // Trata erros
  streams.forEach(stream => {
    handleStreamError(stream, (error) => {
      if (!error.handled) {
        error.handled = true;
        throw error;
      }
    });
  });

  try {
    await pipeline(...streams);
    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Comprime ficheiro usando stream gzip
export async function compressFile(inputPath, outputPath) {
  const readStream = createReadStream(inputPath);
  const gzipStream = zlib.createGzip();
  const writeStream = createWriteStream(outputPath);

  const streams = [readStream, gzipStream, writeStream];

  streams.forEach(stream => {
    handleStreamError(stream, (error) => {
      if (!error.handled) {
        error.handled = true;
        throw error;
      }
    });
  });

  try {
    await pipeline(...streams);
    return { success: true, outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Processa ficheiro com transformação para maiúsculas e retorna estatísticas
export async function processFileUppercase(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(inputPath);
    const transform = new UppercaseTransform();
    const writeStream = createWriteStream(outputPath);

    let stats = null;

    transform.on('stats', (data) => {
      stats = data;
    });

    handleStreamError(readStream, reject);
    handleStreamError(transform, reject);
    handleStreamError(writeStream, reject);

    readStream
      .pipe(transform)
      .pipe(writeStream)
      .on('finish', () => {
        resolve({ success: true, outputPath, stats });
      });
  });
}

// Processa ficheiro com contador de linhas
export async function processFileWithLineCounter(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const readStream = createReadStream(inputPath);
    const counter = new LineCounterTransform();
    const writeStream = createWriteStream(outputPath);

    let stats = null;

    counter.on('stats', (data) => {
      stats = data;
    });

    handleStreamError(readStream, reject);
    handleStreamError(counter, reject);
    handleStreamError(writeStream, reject);

    readStream
      .pipe(counter)
      .pipe(writeStream)
      .on('finish', () => {
        resolve({ success: true, outputPath, stats });
      });
  });
}

// Cria uma resposta de streaming com compressão opcional
export function createStreamingResponse(filePath, acceptEncoding = '') {
  const readStream = createReadStream(filePath);
  
  const shouldCompress = acceptEncoding.includes('gzip');
  
  return {
    stream: shouldCompress 
      ? readStream.pipe(zlib.createGzip())
      : readStream,
    headers: shouldCompress
      ? { 'Content-Encoding': 'gzip' }
      : {}
  };
}

export default {
  copyFileWithTransform,
  compressFile,
  processFileUppercase,
  processFileWithLineCounter,
  createStreamingResponse
};