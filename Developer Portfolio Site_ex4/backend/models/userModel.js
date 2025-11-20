import { pool } from '../db.js';
import { validatePassword, validateName, isValidEmail } from '../utils/validation.js';
import { hashPassword } from '../utils/wasmHash.js';

// Obter todos os utilizadores (sem password por segurança)
export const getAllUsers = async () => {
  const [rows] = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users');
  return rows;
};

// Obter todos os utilizadores com password (para exportação)
export const getAllUsersWithPassword = async () => {
  const [rows] = await pool.query('SELECT id, name, email, password, role, created_at, updated_at FROM users');
  return rows;
};

// Criar utilizador
export const createUser = async (userData) => {
  const { name, email, password, role = 'guest' } = userData;
  
  if (!password) {
    throw new Error('Password é obrigatória para criar utilizador');
  }
  
  // Garantir IDs sequenciais corrigindo AUTO_INCREMENT se necessário
  const [maxResult] = await pool.query('SELECT MAX(id) as maxId FROM users');
  const maxId = maxResult[0].maxId || 0;
  const nextId = maxId + 1;
  
  const [autoIncResult] = await pool.query('SHOW TABLE STATUS LIKE "users"');
  const currentAutoInc = autoIncResult[0]?.Auto_increment || nextId;
  
  if (currentAutoInc > nextId + 1) {
    await pool.query(`ALTER TABLE users AUTO_INCREMENT = ${nextId}`);
  }
  
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  
  const [rows] = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [result.insertId]);
  
  return rows[0] || {
    id: result.insertId,
    name,
    email,
    role,
    created_at: new Date(),
    updated_at: new Date()
  };
};

// Encontrar utilizador por email
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

// Encontrar utilizador por ID
export const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

// Atualizar utilizador
export const updateUser = async (id, updates) => {
  const { name, email, role } = updates;
  const fields = [];
  const values = [];
  
  if (name) {
    fields.push('name = ?');
    values.push(name);
  }
  if (email) {
    fields.push('email = ?');
    values.push(email);
  }
  if (role !== undefined) {
    fields.push('role = ?');
    values.push(role);
  }
  
  if (fields.length === 0) return null;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  
  return await findUserById(id);
};

// Eliminar utilizador
export const deleteUser = async (id) => {
  const user = await findUserById(id);
  if (!user) return null;
  
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return user;
};

// Limpar todos os utilizadores
export const clearAllUsers = async () => {
  await pool.query('DELETE FROM users');
  await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');
  return { message: 'Todos os utilizadores foram eliminados' };
};

// Reorganizar IDs para sequenciais (1, 2, 3...) usando transação
export const resetUserIds = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [users] = await connection.query(
      'SELECT id, name, email FROM users ORDER BY created_at ASC'
    );
    
    if (users.length === 0) {
      await connection.commit();
      connection.release();
      return { message: 'Não há utilizadores para reorganizar', count: 0 };
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('SET UNIQUE_CHECKS = 0');
    
    // Atribuir IDs temporários negativos
    for (let i = 0; i < users.length; i++) {
      const tempId = -(i + 1);
      await connection.query('UPDATE users SET id = ? WHERE id = ?', [tempId, users[i].id]);
    }
    
    // Atribuir IDs finais sequenciais
    for (let i = 0; i < users.length; i++) {
      const newId = i + 1;
      await connection.query('UPDATE users SET id = ? WHERE id = ?', [newId, -(i + 1)]);
    }
    
    const nextId = users.length + 1;
    await connection.query(`ALTER TABLE users AUTO_INCREMENT = ${nextId}`);
    
    await connection.query('SET UNIQUE_CHECKS = 1');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    
    const [reorganizedUsers] = await connection.query(
      'SELECT id, name, email FROM users ORDER BY id ASC'
    );
    
    connection.release();
    
    return {
      message: `IDs reorganizados com sucesso! Utilizadores agora têm IDs de 1 a ${reorganizedUsers.length}`,
      count: reorganizedUsers.length,
      nextId: nextId,
      users: reorganizedUsers.map(u => ({ id: u.id, name: u.name, email: u.email }))
    };
  } catch (error) {
    await connection.rollback();
    await connection.query('SET UNIQUE_CHECKS = 1');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    throw new Error(`Falha ao reorganizar IDs: ${error.message}`);
  }
};

// Importar utilizadores de array (detecta passwords já hasheadas)
export const importUsersFromArray = async (usersArray) => {
  let imported = 0;
  let errors = 0;
  const errorMessages = [];

  for (const userData of usersArray) {
    try {
      if (!userData.email || !userData.name || !userData.password) {
        errors++;
        errorMessages.push(`${userData.email || 'Unknown'}: Faltam campos obrigatórios (email, name, password)`);
        continue;
      }

      const existing = await findUserByEmail(userData.email);
      if (existing) {
        errors++;
        errorMessages.push(`${userData.email}: Já existe`);
        continue;
      }

      // Validar password antes de importar
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.valid) {
        errors++;
        errorMessages.push(`${userData.email || 'Unknown'}: ${passwordValidation.error}`);
        continue;
      }

      // Validar nome
      const nameValidation = validateName(userData.name);
      if (!nameValidation.valid) {
        errors++;
        errorMessages.push(`${userData.email || 'Unknown'}: ${nameValidation.error}`);
        continue;
      }

      // Validar email
      if (!isValidEmail(userData.email)) {
        errors++;
        errorMessages.push(`${userData.email || 'Unknown'}: Email inválido`);
        continue;
      }

      // Detectar se password já está hasheada (WASM)
      const isAlreadyHashed = userData.password.startsWith('$wasm$');
      const passwordToUse = isAlreadyHashed
        ? userData.password
        : await hashPassword(userData.password);

      await createUser({
        name: nameValidation.sanitized,
        email: userData.email.toLowerCase().trim(),
        password: passwordToUse,
        role: userData.role || 'guest'
      });

      imported++;
    } catch (error) {
      errors++;
      errorMessages.push(`${userData.email || 'Unknown'}: ${error.message}`);
    }
  }

  return { imported, errors, errorMessages };
};