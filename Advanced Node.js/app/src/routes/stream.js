// Rotas de resposta por streaming

import { createStreamingResponse } from '../streams/streamHandler.js';
import { getUploadDir } from '../streams/fileStream.js';
import fs from 'fs';
import path from 'path';

// Faz streaming de um ficheiro como resposta HTTP
export function handleStream(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filename = url.searchParams.get('file');

  if (!filename) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Parâmetro file em falta' }));
    return;
  }

  const filePath = path.join(getUploadDir(), filename);

  // Verifica se o ficheiro existe
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ficheiro não encontrado' }));
    return;
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  const { stream, headers } = createStreamingResponse(filePath, acceptEncoding);

  // Define cabeçalhos da resposta
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    ...headers
  });

  // Trata erros
  stream.on('error', (error) => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });

  // Faz pipe do stream para a resposta
  stream.pipe(res);
}

// Faz streaming de um ficheiro gerado (demonstra streaming sem ficheiro)
export function handleStreamGenerated(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const lines = parseInt(url.searchParams.get('lines') || '1000', 10);

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  let count = 0;
  const interval = setInterval(() => {
    if (count >= lines) {
      clearInterval(interval);
      res.end();
      return;
    }

    const chunk = `Linha ${count + 1}: Esta é uma linha de resposta por streaming.\n`;
    res.write(chunk);
    count++;
  }, 10);

  req.on('close', () => {
    clearInterval(interval);
  });
}

export default {
  handleStream,
  handleStreamGenerated
};