import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, getAllUsers, updateUser, deleteUser, clearAllUsers, resetUserIds } from '../models/userModel.js';
import { generateToken } from '../utils/tokenUtils.js';

// Função auxiliar para gerar token
const generateUserToken = (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
};

// Função auxiliar para formatar resposta do utilizador
const formatUserResponse = (user) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
};

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validação
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, palavra-passe e nome são obrigatórios' });
    }

    // Verificar se o utilizador existe
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Utilizador já existe' });
    }

    // Encriptar palavra-passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar utilizador (ID é gerado automaticamente no model)
    const user = createUser({
      email,
      password: hashedPassword,
      name,
      role: role || 'guest',
      createdAt: new Date().toISOString()
    });

    const token = generateUserToken(user);

    res.status(201).json({
      message: 'Utilizador registado com sucesso',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha no registo' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e palavra-passe são obrigatórios' });
    }

    // Encontrar utilizador
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar palavra-passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateUserToken(user);

    res.json({
      message: 'Login efetuado com sucesso',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha no login' });
  }
};

export const getDashboard = (req, res) => {
  res.json({
    message: `Bem-vindo, ${req.user.name}!`,
    user: req.user
  });
};

export const getUsers = (req, res) => {
  try {
    const users = getAllUsers().map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao carregar utilizadores' });
  }
};

export const editUser = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validação
    if (!name && !email && role === undefined) {
      return res.status(400).json({ error: 'Pelo menos um campo (nome, email ou cargo) é obrigatório' });
    }

    // Verificar se o email já está a ser usado por outro utilizador
    if (email) {
      const existingUser = findUserByEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }

    const updatedUser = updateUser(parseInt(id), { name, email, role });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json({
      message: 'Utilizador atualizado com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar utilizador' });
  }
};

export const removeUser = (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = deleteUser(parseInt(id));
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json({
      message: 'Utilizador eliminado com sucesso',
      user: {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao eliminar utilizador' });
  }
};

export const clearUsers = (req, res) => {
  try {
    const result = clearAllUsers();
    res.json({
      ...result,
      info: 'Tokens emitidos tornam-se inválidos imediatamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao limpar utilizadores' });
  }
};

export const resetUsersIds = (req, res) => {
  try {
    const result = resetUserIds();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao reiniciar IDs dos utilizadores' });
  }
};

export const importUsers = async (req, res) => {
  // Verificação de segurança: apenas admins podem importar
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Esta operação requer cargo de admin' });
  }

  try {
    const { users } = req.body;

    // Validação
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Deve ser fornecido um array de utilizadores' });
    }

    let imported = 0;
    let errors = 0;
    const errorMessages = [];

    for (const userData of users) {
      try {
        // Validar campos obrigatórios
        if (!userData.email || !userData.name) {
          errors++;
          errorMessages.push(`${userData.email || 'Desconhecido'}: Email e nome são obrigatórios`);
          continue;
        }

        // Verificar se já existe
        const existingUser = findUserByEmail(userData.email);
        if (existingUser) {
          errors++;
          errorMessages.push(`${userData.email}: Utilizador já existe`);
          continue;
        }

        // Validar password
        if (!userData.password) {
          errors++;
          errorMessages.push(`${userData.email}: Password é obrigatório`);
          continue;
        }

        // Encriptar palavra-passe
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Validar role
        if (!userData.role || !['admin', 'editor', 'guest'].includes(userData.role)) {
          errors++;
          errorMessages.push(`${userData.email}: Role inválido. Deve ser admin, editor ou guest`);
          continue;
        }

        // Criar utilizador
        const user = createUser({
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role
        });

        imported++;
      } catch (error) {
        errors++;
        errorMessages.push(`${userData.email || 'Desconhecido'}: ${error.message}`);
      }
    }

    res.json({
      message: `Importação concluída: ${imported} utilizador(es) importado(s), ${errors} erro(s)`,
      imported,
      errors,
      errorDetails: errorMessages.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao importar utilizadores' });
  }
};