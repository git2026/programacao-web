/* Controller de Autenticação e Gestão de Utilizadores */
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
import { validatePassword, validateName, isValidEmail, isValidRole, validateRequiredFields } from '../utils/validation.js';
import { hashPassword, verifyPassword } from '../utils/wasmHash.js';
import { ERROR_MESSAGES } from '../utils/errorMessages.js';

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

    // Validações obrigatórias com mensagens específicas
    const required = validateRequiredFields({ email, password, name }, ['email', 'password', 'name']);
    if (!required.valid) {
      return sendError(res, 400, required.error);
    }

    // Validar email
    if (!isValidEmail(email)) {
      return sendError(res, 400, ERROR_MESSAGES.EMAIL_INVALID);
    }

    // Validar password (12 a 20 caracteres)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return sendError(res, 400, passwordValidation.error);
    }

    // Validar e limpar nome (mínimo 5 caracteres)
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return sendError(res, 400, nameValidation.error);
    }
    const sanitizedName = nameValidation.sanitized;

    // Validar cargo se fornecido
    if (role && !isValidRole(role)) {
      return sendError(res, 400, ERROR_MESSAGES.ROLE_INVALID);
    }

    // Verificar se email já existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return sendError(res, 400, `Email "${email}" já está registado. Use outro email ou faça login.`);
    }

    // Hash password com WebAssembly (SHA-512)
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      console.error('[Backend] Erro ao fazer hash da password:', hashError);
      return sendError(res, 500, 'Erro ao processar password', hashError.message);
    }

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
    console.error('[Backend] Erro no registo:', error);
    sendError(res, 500, 'Erro no registo', error.message);
  }
};

// Login de utilizador
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar email e password
    const required = validateRequiredFields({ email, password }, ['email', 'password']);
    if (!required.valid) {
      return sendError(res, 400, required.error);
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return sendError(res, 400, ERROR_MESSAGES.EMAIL_INVALID);
    }

    // Encontrar utilizador por email
    const user = await findUserByEmail(email);
    if (!user) {
      return sendError(res, 401, 'Email não encontrado. Verifique se o email está correto ou registe-se primeiro.');
    }

    // Verificar password com WebAssembly (SHA-512)
    let isValidPassword;
    try {
      isValidPassword = await verifyPassword(password, user.password);
    } catch (verifyError) {
      console.error('[Backend] Erro ao verificar password:', verifyError);
      return sendError(res, 500, 'Erro ao verificar credenciais', verifyError.message);
    }
    
    // Validar password
    if (!isValidPassword) {
      return sendError(res, 401, 'Password incorreta. Verifique se a password está correta.');
    }

    // Gerar token JWT
    const token = generateUserToken(user);
    res.json({
      message: 'Login com sucesso',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('[Backend] Erro no login:', error);
    sendError(res, 500, 'Erro no login', error.message);
  }
};

// Dashboard de utilizador
export const getDashboard = (req, res) => {
  res.json({
    message: `Bem-vindo, ${req.user.name}!`,
    user: req.user
  });
};
  
// Obter todos os utilizadores
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    sendError(res, 500, 'Erro ao carregar utilizadores', error.message);
  }
};

// Atualizar utilizador
export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validar se pelo menos um campo foi fornecido
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
        return sendError(res, 400, ERROR_MESSAGES.ROLE_INVALID);
      }
      updates.role = role;
    }

    // Atualizar utilizador
    const updatedUser = await updateUser(parseInt(id), updates);
      
    // Validar se o utilizador foi encontrado
    if (!updatedUser) {
      return sendError(res, 404, 'Utilizador não encontrado');
    }

    // Retorna com sucesso
    res.json({
      message: 'Atualizado com sucesso',
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    sendError(res, 500, 'Erro ao atualizar', error.message);
  }
};

// Eliminar utilizador
export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(parseInt(id));
    
    // Validar se o utilizador foi encontrado
    if (!deletedUser) {
      return sendError(res, 404, 'Utilizador não encontrado');
    }

    // Retorna com sucesso
    res.json({
      message: 'Eliminado com sucesso',
      user: formatUserResponse(deletedUser)
    });
  } catch (error) {
    sendError(res, 500, 'Erro ao eliminar', error.message);
  }
};

// Limpar todos os utilizadores
export const clearUsers = async (req, res) => {
  try {
    const result = await clearAllUsers();
    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Erro ao limpar utilizadores', error.message);
  }
};

// Reiniciar IDs dos utilizadores
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

    // Importar utilizadores de array
    const result = await importUsersFromArray(users);

    // Retorna com sucesso
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

// Exportar utilizadores de MySQL para JSON (com password em hashed)
export const exportUsers = async (req, res) => {
  try {
    const users = await getAllUsersWithPassword();
    
    // Retorna com sucesso
    res.json(users);
  } catch (error) {
    sendError(res, 500, 'Erro na exportação', error.message);
  }
};