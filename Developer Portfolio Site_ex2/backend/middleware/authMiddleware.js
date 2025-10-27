import { verifyToken } from '../utils/tokenUtils.js';
import { findUserById } from '../models/userModel.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  // Verificar se o utilizador ainda existe
  const user = findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({ error: 'Token inválido: utilizador não existe' });
  }

  req.user = decoded;
  next();
};