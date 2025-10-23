// In-memory user storage (replace with database in production)
const users = [];
let nextId = 1;
const freedIds = []; // Stack of freed IDs for reuse

// Get next available ID (reuse freed IDs or increment)
const getNextId = () => {
  if (freedIds.length > 0) {
    return freedIds.pop(); // Reuse freed ID
  }
  return nextId++;
};

export const createUser = (user) => {
  const newUser = {
    ...user,
    id: getNextId()
  };
  users.push(newUser);
  return newUser;
};

export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

export const getAllUsers = () => {
  return users;
};

export const updateUser = (id, updates) => {
  const user = users.find(user => user.id === id);
  if (user) {
    // Update only provided fields (except password and id)
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role; // Allow null to remove role
    user.updatedAt = new Date().toISOString();
    return user;
  }
  return null;
};

export const deleteUser = (id) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const deletedUser = users.splice(index, 1)[0];
    freedIds.push(id); // Add freed ID to the stack for reuse
    freedIds.sort((a, b) => b - a); // Keep sorted descending for LIFO
    return deletedUser;
  }
  return null;
};

