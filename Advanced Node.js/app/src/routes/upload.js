// Manipulador de rota para upload de ficheiros usando streams

import { createWriteStream, ensureUploadDir, getUploadDir } from '../streams/fileStream.js';
import { UppercaseTransform, LineCounterTransform } from '../streams/transformStream.js';
import { pipeline } from 'stream/promises';
import path from 'path';
import fs from 'fs';

// Obtém o próximo número sequencial para o nome do ficheiro
// Trata concorrência entre múltiplos workers
function getNextUploadNumber() {
  try {
    const uploadDir = getUploadDir();
    ensureUploadDir();
    
    if (!fs.existsSync(uploadDir)) {
      return 1;
    }
    
    const files = fs.readdirSync(uploadDir);
    const uploadFiles = files.filter(f => {
      // Apenas ficheiros que correspondem ao padrão upload_n.txt
      return f.startsWith('upload_') && f.endsWith('.txt') && /^upload_\d+\.txt$/.test(f);
    });
    
    if (uploadFiles.length === 0) {
      return 1;
    }
    
    const numbers = uploadFiles
      .map(f => {
        const match = f.match(/^upload_(\d+)\.txt$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0 && !isNaN(n));
    
    if (numbers.length === 0) {
      return 1;
    }
    
    const maxNumber = Math.max(...numbers);
    return maxNumber + 1;
  } catch (error) {
    console.error('Erro ao obter próximo número de upload:', error);
    return 1;
  }
}

// Obtém um número de upload disponível (verifica se o ficheiro já existe)
function getAvailableUploadNumber() {
  let attempt = 0;
  const maxAttempts = 100;
  
  while (attempt < maxAttempts) {
    const uploadNumber = getNextUploadNumber();
    const filename = `upload_${uploadNumber}.txt`;
    const filePath = path.join(getUploadDir(), filename);
    
    // Verifica se o ficheiro já existe (condição de corrida)
    if (!fs.existsSync(filePath)) {
      return uploadNumber;
    }
    
    // Se existe, tenta o próximo
    attempt++;
  }
  
  // Fallback: usa timestamp se houver muitos conflitos
  return Date.now();
}

// Processa o upload de ficheiro com transformação opcional
export async function handleUpload(req, res, transformType = null) {
  ensureUploadDir();

  const uploadNumber = getAvailableUploadNumber();
  const filename = `upload_${uploadNumber}.txt`;
  const outputPath = path.join(getUploadDir(), filename);


  const writeStream = createWriteStream(outputPath);
  let transform = null;
  let stats = null;

  // Cria transformação baseada no parâmetro da query
  if (transformType === 'uppercase' || req.url.includes('transform=uppercase')) {
    transform = new UppercaseTransform();
    transform.on('stats', (data) => {
      stats = data;
    });
  } else if (transformType === 'count' || req.url.includes('transform=count')) {
    transform = new LineCounterTransform();
    transform.on('stats', (data) => {
      stats = data;
    });
  }

  try {
    const streams = [req];
    if (transform) {
      streams.push(transform);
    }
    streams.push(writeStream);

    // Trata erros
    streams.forEach(stream => {
      stream.on('error', (error) => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    });

    await pipeline(...streams);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      filename,
      uploadNumber,
      stats
    }));
  } catch (error) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }
}

export default {
  handleUpload
};