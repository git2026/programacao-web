import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};