export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'chave_secreta',
  nodeEnv: process.env.NODE_ENV || 'development'
};

