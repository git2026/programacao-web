// Middleware de Autenticação JWT para todas as rotas protegidas da API

import { verifyToken } from '../utils/tokenUtils.js';
import { findUserById } from '../models/userModel.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

// Middleware de autenticação JWT
export const authMiddleware = async (req, res, next) => {
  // Verificar autenticação para: método e caminho
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: ERROR_MESSAGES.TOKEN_REQUIRED });
  }
  // Extrair token do header
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  // Verificar se o token é válido
  if (!decoded) {
    return res.status(401).json({ error: ERROR_MESSAGES.TOKEN_INVALID });
  }

  try {
    // Buscar utilizador pelo ID
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Token inválido: utilizador não existe' });
    }

    // Adicionar utilizador ao request para uso nas rotas
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth Middleware] ERRO ao verificar autenticação:', error);
    return res.status(500).json({ error: 'Erro ao verificar autenticação' });
  }
};