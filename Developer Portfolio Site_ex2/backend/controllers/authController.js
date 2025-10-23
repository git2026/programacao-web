import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, getAllUsers, updateUser, deleteUser } from '../models/userModel.js';
import { generateToken } from '../utils/tokenUtils.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (ID is auto-generated in the model)
    const user = createUser({
      email,
      password: hashedPassword,
      name,
      role: role || 'guest', // default to guest
      createdAt: new Date().toISOString()
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getDashboard = (req, res) => {
  res.json({
    message: `Welcome to your dashboard, ${req.user.email}!`,
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
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const editUser = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validation
    if (!name && !email && role === undefined) {
      return res.status(400).json({ error: 'At least one field (name, email, or role) is required' });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = findUserByEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = updateUser(parseInt(id), { name, email, role });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const removeUser = (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = deleteUser(parseInt(id));
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

