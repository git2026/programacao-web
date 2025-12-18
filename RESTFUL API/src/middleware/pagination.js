// Middleware de Paginação
// Valida e normaliza parâmetros de paginação

const paginationMiddleware = (req, res, next) => {
  const MAX_LIMIT = 50;
  const DEFAULT_LIMIT = 10;

  // Extrair parâmetros da query
  let limit = parseInt(req.query.limit, 10);
  const cursor = req.query.cursor || null;

  // Validar e normalizar limite
  if (isNaN(limit) || limit <= 0) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    return res.status(400).json({
      error: `O limite não pode exceder ${MAX_LIMIT}`,
      maxLimit: MAX_LIMIT
    });
  }

  // Guardar informação de paginação no objeto request
  req.pagination = {
    limit,
    cursor,
    maxLimit: MAX_LIMIT
  };

  next();
};

module.exports = {
  paginationMiddleware
};