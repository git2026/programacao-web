// Streams de transformação personalizados
import { Transform } from 'stream';

// Stream de transformação que converte texto para maiúsculas
export class UppercaseTransform extends Transform {
  constructor(options = {}) {
    super({
      objectMode: false,
      ...options
    });
    this.charCount = 0;
  }

  _transform(chunk, encoding, callback) {
    const upperChunk = chunk.toString().toUpperCase();
    this.charCount += upperChunk.length;
    this.push(upperChunk, 'utf8');
    callback();
  }

  _flush(callback) {
    // Emite metadados antes de terminar
    this.emit('stats', { charCount: this.charCount });
    callback();
  }

  getStats() {
    return { charCount: this.charCount };
  }
}

// Stream de transformação que conta linhas
export class LineCounterTransform extends Transform {
  constructor(options = {}) {
    super({
      objectMode: false,
      ...options
    });
    this.lineCount = 0;
    this.charCount = 0;
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    
    // Mantém a última linha incompleta no buffer
    this.buffer = lines.pop() || '';
    
    // Processa linhas completas
    this.lineCount += lines.length;
    this.charCount += chunk.length;
    
    // Passa os dados adiante
    this.push(chunk);
    callback();
  }

  _flush(callback) {
    // Conta a última linha se o buffer não estiver vazio
    if (this.buffer.trim()) {
      this.lineCount++;
    }
    this.emit('stats', { 
      lineCount: this.lineCount, 
      charCount: this.charCount 
    });
    callback();
  }

  getStats() {
    return { 
      lineCount: this.lineCount, 
      charCount: this.charCount 
    };
  }
}

// Stream de transformação que adiciona um prefixo a cada linha
export class PrefixTransform extends Transform {
  constructor(prefix = '', options = {}) {
    super({
      objectMode: false,
      ...options
    });
    this.prefix = prefix;
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';
    
    const prefixed = lines
      .map(line => `${this.prefix}${line}\n`)
      .join('');
    
    this.push(prefixed, 'utf8');
    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      this.push(`${this.prefix}${this.buffer}`);
    }
    callback();
  }
}

export default {
  UppercaseTransform,
  LineCounterTransform,
  PrefixTransform
};