import { 
  createUser, 
  findUserByEmail, 
  getAllUsers,
  getAllUsersWithPassword, 
  updateUser, 
  deleteUser, 
  clearAllUsers, 
  resetUserIds,
  importUsersFromArray 
} from '../models/userModel.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendError } from '../utils/errorHandler.js';
import { validatePassword, validateName, isValidEmail, isValidRole } from '../utils/validation.js';
import { hashPassword, verifyPassword } from '../utils/wasmHash.js';

// Gerar token JWT para utilizador
const generateUserToken = (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
};

// Formatar resposta do utilizador (sem password por segurança)
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

    // Validações obrigatórias
    if (!email || !password || !name) {
      return sendError(res, 400, 'Email, password e nome obrigatórios');
    }

    // Validar email
    if (!isValidEmail(email)) {
      return sendError(res, 400, 'Email inválido');
    }

    // Validar password (12 a 20 caracteres)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return sendError(res, 400, passwordValidation.error);
    }

    // Validar e sanitizar nome (mínimo 5 caracteres)
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return sendError(res, 400, nameValidation.error);
    }
    const sanitizedName = nameValidation.sanitized;

    // Validar role se fornecido
    if (role && !isValidRole(role)) {
      return sendError(res, 400, 'Role inválido. Valores permitidos: admin, editor, guest');
    }

    // Verificar se email já existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return sendError(res, 400, 'Email já existe');
    }

    // Hash password com WebAssembly (SHA-512)
    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: sanitizedName,
      role: role || 'guest'
    });

    const token = generateUserToken(user);

    res.status(201).json({
      message: 'Registado com sucesso',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    sendError(res, 500, 'Erro no registo', error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email e password obrigatórios');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return sendError(res, 401, 'Credenciais inválidas');
    }

    // Verificar password com WebAssembly (SHA-512)
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return sendError(res, 401, 'Credenciais inválidas');
    }

    const token = generateUserToken(user);

    res.json({
      message: 'Login com sucesso',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    sendError(res, 500, 'Erro no login', error.message);
  }
};

export const getDashboard = (req, res) => {
  res.json({
    message: `Bem-vindo, ${req.user.name}!`,
    user: req.user
  });
};

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    sendError(res, 500, 'Erro ao carregar utilizadores', error.message);
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name && !email && role === undefined) {
      return sendError(res, 400, 'Pelo menos um campo obrigatório');
    }

    const updates = {};

    // Validar e sanitizar nome se fornecido
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return sendError(res, 400, nameValidation.error);
      }
      updates.name = nameValidation.sanitized;
    }

    // Validar email se fornecido
    if (email) {
      if (!isValidEmail(email)) {
        return sendError(res, 400, 'Email inválido');
      }
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return sendError(res, 400, 'Email já existe');
      }
      updates.email = email.toLowerCase().trim();
    }

    // Validar role se fornecido
    if (role !== undefined) {
      if (!isValidRole(role)) {
        return sendError(res, 400, 'Role inválido. Valores permitidos: admin, editor, guest');
      }
      updates.role = role;
    }

    const updatedUser = await updateUser(parseInt(id), updates);
    
    if (!updatedUser) {
      return sendError(res, 404, 'Utilizador não encontrado');
    }

    res.json({
      message: 'Atualizado com sucesso',
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    sendError(res, 500, 'Erro ao atualizar', error.message);
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(parseInt(id));
    
    if (!deletedUser) {
      return sendError(res, 404, 'Utilizador não encontrado');
    }

    res.json({
      message: 'Eliminado com sucesso',
      user: formatUserResponse(deletedUser)
    });
  } catch (error) {
    sendError(res, 500, 'Erro ao eliminar', error.message);
  }
};

export const clearUsers = async (req, res) => {
  try {
    const result = await clearAllUsers();
    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Erro ao limpar utilizadores', error.message);
  }
};

export const resetUsersIds = async (req, res) => {
  try {
    const result = await resetUserIds();
    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Erro ao reiniciar IDs', error.message);
  }
};

// Importar utilizadores de JSON para MySQL
export const importUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return sendError(res, 400, 'Array de utilizadores necessário');
    }

    const result = await importUsersFromArray(users);

    res.json({
      message: `Importação: ${result.imported} importados, ${result.errors} erros`,
      imported: result.imported,
      errors: result.errors,
      errorDetails: result.errorMessages.slice(0, 5)
    });
  } catch (error) {
    sendError(res, 500, 'Erro na importação', error.message);
  }
};

// Exportar utilizadores de MySQL para JSON (com password hasheada)
export const exportUsers = async (req, res) => {
  try {
    const users = await getAllUsersWithPassword();
    
    res.json(users);
  } catch (error) {
    sendError(res, 500, 'Erro na exportação', error.message);
  }
};

