// Utilitários para Gestão de Tokens JWT

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta';

/**
 * Gera token JWT
 * @param {Object} payload - Dados do utilizador (id, email, name, role)
 * @returns {string} Token JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload decodificado ou null se inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};