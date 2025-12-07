// Utilitários para Gestão de Tokens JWT

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta';

// Gera token JWT
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};


// Verifica e decodifica token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};