const crypto = require('crypto');

// Armazenamento de cache em memória
const cacheStore = new Map();

// Middleware de cache com suporte a ETag
const cacheMiddleware = (req, res, next) => {
  // Apenas cachear pedidos GET
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = req.originalUrl;
  const clientETag = req.headers['if-none-match'];
  const cached = cacheStore.get(cacheKey);
  
  if (cached) {
    // Se o cliente tem o mesmo ETag, retornar 304 Not Modified
    if (clientETag && clientETag === cached.etag) {
      return res.status(304).end();
    }
    
    // Definir headers de cache e retornar dados em cache
    res.set({
      'ETag': cached.etag,
      'Cache-Control': 'public, max-age=60',
      'Last-Modified': cached.lastModified
    });
    
    return res.json(cached.data);
  }

  // Sem cache - continuar para o controller
  // Guardar método json original para interceptar resposta
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // Gerar ETag a partir dos dados da resposta
    const dataString = JSON.stringify(data);
    const etag = crypto.createHash('md5').update(dataString).digest('hex');
    const lastModified = new Date().toUTCString();
    
    // Guardar em cache
    cacheStore.set(cacheKey, {
      data,
      etag: `"${etag}"`,
      lastModified,
      timestamp: Date.now()
    });
    
    // Definir headers de cache
    res.set({
      'ETag': `"${etag}"`,
      'Cache-Control': 'public, max-age=60',
      'Last-Modified': lastModified
    });
    
    return originalJson(data);
  };
  
  next();
};

// Limpeza de entradas antigas de cache (gestão de memória)
setInterval(() => {
  const now = Date.now();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  
  for (const [key, value] of cacheStore.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cacheStore.delete(key);
    }
  }
}, 60 * 1000);

module.exports = {
  cacheMiddleware
};