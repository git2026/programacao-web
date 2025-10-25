import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, getAllUsers, updateUser, deleteUser, clearAllUsers, resetUserIds } from '../models/userModel.js';
import { generateToken } from '../utils/tokenUtils.js';

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

    // Criar utilizador (ID é gerado automaticamente no modelo)
    const user = createUser({
      email,
      password: hashedPassword,
      name,
      role: role || 'guest', // padrão: guest
      createdAt: new Date().toISOString()
    });

    // Gerar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'Utilizador registado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
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

    // Gerar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login efetuado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
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
    res.json(result);
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

