export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  nodeEnv: process.env.NODE_ENV || 'development'
};

