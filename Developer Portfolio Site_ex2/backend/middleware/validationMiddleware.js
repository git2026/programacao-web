import { body, param, validationResult } from 'express-validator';

// Middleware para tratar erros de validação
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Dados inválidos', 
      details: errors.array().map(err => err.msg)
    });
  }
  next();
};

// Validações de autenticação
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Palavra-passe deve ter no mínimo 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'guest'])
    .withMessage('Cargo deve ser admin, editor ou guest'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Palavra-passe é obrigatória'),
  handleValidationErrors
];

export const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do utilizador inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('role')
    .optional()
    .custom(value => value === null || ['admin', 'editor', 'guest'].includes(value))
    .withMessage('Cargo deve ser admin, editor, guest ou null'),
  handleValidationErrors
];

export const validateDeleteUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do utilizador inválido'),
  handleValidationErrors
];

// Validações de projetos
export const validateCreateProject = [
  body('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Título deve ter no mínimo 3 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Descrição deve ter no mínimo 10 caracteres'),
  body('technologies')
    .optional()
    .custom(value => Array.isArray(value) || value === null || value === undefined)
    .withMessage('Tecnologias deve ser um array'),
  body('image')
    .optional()
    .trim(),
  body('github')
    .optional()
    .trim()
    .custom(value => value === null || value === '' || /^https?:\/\//.test(value))
    .withMessage('GitHub deve ser um URL válido ou vazio'),
  handleValidationErrors
];

export const validateUpdateProject = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do projeto inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Título deve ter no mínimo 3 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Descrição deve ter no mínimo 10 caracteres'),
  body('technologies')
    .optional()
    .custom(value => Array.isArray(value) || value === null || value === undefined)
    .withMessage('Tecnologias deve ser um array'),
  body('image')
    .optional()
    .trim(),
  body('github')
    .optional()
    .trim()
    .custom(value => value === null || value === '' || /^https?:\/\//.test(value))
    .withMessage('GitHub deve ser um URL válido ou vazio'),
  handleValidationErrors
];

export const validateDeleteProject = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do projeto inválido'),
  handleValidationErrors
];

export const validateGetProject = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do projeto inválido'),
  handleValidationErrors
];

