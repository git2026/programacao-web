const crypto = require('crypto');

// Controller de Autenticação
// Processa pedidos de login

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validação: verificar se os campos estão preenchidos
    if (!username || !password) {
      return res.status(400).json({
        error: 'Nome de utilizador e palavra-passe são obrigatórios'
      });
    }
    
    // Autenticação simulada - aceita quaisquer credenciais para demonstração
    const token = `Bearer ${crypto.randomBytes(32).toString('hex')}`;
    
    res.json({
      message: 'Login realizado com sucesso',
      token: token,
      user: {
        username,
        role: username === 'admin' ? 'admin' : 'user'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};