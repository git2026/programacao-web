export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'chave_teste',
  nodeEnv: process.env.NODE_ENV || 'development'
};

