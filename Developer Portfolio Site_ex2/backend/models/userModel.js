// In-memory user storage (replace with database in production)
const users = [];

export const createUser = (user) => {
  users.push(user);
  return user;
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

