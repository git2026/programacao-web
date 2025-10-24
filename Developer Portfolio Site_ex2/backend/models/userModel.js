import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, '../data/users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(path.dirname(usersFilePath))) {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
}

if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

let nextId = 1;
const freedIds = []; // Stack of freed IDs for reuse

// Get next available ID (reuse freed IDs or increment)
const getNextId = () => {
  if (freedIds.length > 0) {
    return freedIds.pop();
  }
  return nextId++;
};

// Initialize nextId based on existing users
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
    // Update only provided fields (except password and id)
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role; // Allow null to remove role
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
    freedIds.push(id); // Add freed ID to the stack for reuse
    freedIds.sort((a, b) => b - a); // Keep sorted descending for LIFO
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return deletedUser;
  }
  return null;
};

// Initialize on module load
initializeUserId();

