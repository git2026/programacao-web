// Formatar erros com detalhes condicionais (apenas em desenvolvimento)
export const formatError = (message, details = null) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const error = { error: message };
  if (isDevelopment && details) {
    error.details = details;
  }
  return error;
};

// Enviar resposta de erro padronizada
export const sendError = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json(formatError(message, details));
};

