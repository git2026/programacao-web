import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, '../data/users.json');

// Inicializar ficheiro de utilizadores se não existir
if (!fs.existsSync(path.dirname(usersFilePath))) {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
}

if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

let nextId = 1;
const freedIds = []; // Pilha de IDs libertados para reutilização

// Obter próximo ID disponível (reutilizar IDs libertados ou incrementar)
const getNextId = () => {
  if (freedIds.length > 0) {
    return freedIds.pop();
  }
  return nextId++;
};

// Inicializar nextId com base nos utilizadores existentes
const initializeUserId = () => {
  const users = getAllUsers();
  if (users.length > 0) {
    const maxId = Math.max(...users.map(u => parseInt(u.id) || 0));
    nextId = maxId + 1;
  }
};

export const getAllUsers = () => {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
};

export const createUser = (user) => {
  const users = getAllUsers();
  const newUser = {
    ...user,
    id: getNextId(),
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  return newUser;
};

export const findUserByEmail = (email) => {
  const users = getAllUsers();
  return users.find(user => user.email === email);
};

export const findUserById = (id) => {
  const users = getAllUsers();
  return users.find(user => user.id === id);
};

export const updateUser = (id, updates) => {
  const users = getAllUsers();
  const user = users.find(user => user.id === id);
  if (user) {
    // Atualizar apenas campos fornecidos (exceto password e id)
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role; // Permitir null para remover cargo
    user.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return user;
  }
  return null;
};

export const deleteUser = (id) => {
  const users = getAllUsers();
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const deletedUser = users.splice(index, 1)[0];
    freedIds.push(id); // Adicionar ID libertado à pilha para reutilização
    freedIds.sort((a, b) => b - a); // Manter ordenado descendente para LIFO
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return deletedUser;
  }
  return null;
};

export const clearAllUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
  nextId = 1;
  freedIds.length = 0; // Limpar array de IDs libertados
  return { message: 'Todos os utilizadores foram eliminados' };
};

export const resetUserIds = () => {
  const users = getAllUsers();
  
  if (users.length === 0) {
    return { message: 'Não há utilizadores para resetar IDs', count: 0 };
  }
  
  // Reiniciar IDs iterativamente de 1 até o número total de utilizadores
  const resetUsers = users.map((user, index) => ({
    ...user,
    id: index + 1
  }));
  
  // Reiniciar contadores
  nextId = resetUsers.length + 1;
  freedIds.length = 0;
  
  // Guardar no ficheiro
  fs.writeFileSync(usersFilePath, JSON.stringify(resetUsers, null, 2));
  
  return { 
    message: `IDs dos utilizadores foram reiniciados sequencialmente (1-${resetUsers.length})`, 
    count: resetUsers.length,
    ids: resetUsers.map(u => u.id)
  };
};

// Inicializar ao carregar o módulo
initializeUserId();

