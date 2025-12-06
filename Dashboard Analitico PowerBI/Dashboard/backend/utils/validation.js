// Validações de segurança e sanitização
import sanitizeHtml from 'sanitize-html';

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 20;
const MIN_NAME_LENGTH = 5;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TECH_LENGTH = 100;

// Configuração de sanitização HTML (restritiva)
const SANITIZE_OPTIONS = {
  allowedTags: [],
  allowedAttributes: {},
  allowedSchemes: [],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [],
  allowProtocolRelative: false
};

// Validar email
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  if (email.length > MAX_EMAIL_LENGTH) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar password (12 a 20 caracteres)
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password é obrigatória' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Password deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, error: `Password deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres` };
  }
  return { valid: true };
};

// Validar nome
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nome é obrigatório' };
  }
  // Sanitizar HTML primeiro
  const sanitized = sanitizeHtmlString(name);
  const trimmedName = sanitized.trim();
  
  if (trimmedName.length < MIN_NAME_LENGTH) {
    return { valid: false, error: `Nome deve ter pelo menos ${MIN_NAME_LENGTH} caracteres` };
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { valid: false, error: 'Nome demasiado longo' };
  }
  
  // Verificar eventos JavaScript e protocolos perigosos
  if (/javascript:|on\w+\s*=|data:text\/html|vbscript:|file:/i.test(trimmedName)) {
    return { valid: false, error: 'Nome contém código malicioso' };
  }
  
  return { valid: true, sanitized: trimmedName };
};

// Sanitizar string (prevenir XSS básico)
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>\"']/g, '');
};

// Limpar HTML (remove todas as tags e caracteres perigosos)
export const sanitizeHtmlString = (html) => {
  if (!html || typeof html !== 'string') return '';
  // Remove HTML tags e scripts
  const sanitized = sanitizeHtml(html, SANITIZE_OPTIONS);
  // Remove caracteres perigosos adicionais
  return sanitized
    .trim()
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/<script/gi, '')
    .replace(/<\/script>/gi, '');
};

// Validar e sanitizar título de projeto
export const validateAndSanitizeTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Título é obrigatório' };
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return { valid: false, error: 'Título não pode estar vazio' };
  }
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Título demasiado longo (máximo ${MAX_TITLE_LENGTH} caracteres)` };
  }
  // Sanitizar HTML
  const sanitized = sanitizeHtmlString(trimmedTitle);
  if (sanitized.length === 0) {
    return { valid: false, error: 'Título inválido após sanitização' };
  }
  return { valid: true, sanitized };
};

// Validar e sanitizar descrição de projeto
export const validateAndSanitizeDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Descrição é obrigatória' };
  }
  const trimmedDesc = description.trim();
  if (trimmedDesc.length === 0) {
    return { valid: false, error: 'Descrição não pode estar vazia' };
  }
  if (trimmedDesc.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Descrição demasiado longa (máximo ${MAX_DESCRIPTION_LENGTH} caracteres)` };
  }
  // Sanitizar HTML
  const sanitized = sanitizeHtmlString(trimmedDesc);
  if (sanitized.length === 0) {
    return { valid: false, error: 'Descrição inválida após sanitização' };
  }
  return { valid: true, sanitized };
};

// Validar e sanitizar tecnologia
export const validateAndSanitizeTechnology = (tech) => {
  if (!tech || typeof tech !== 'string') {
    return { valid: false, error: 'Tecnologia inválida' };
  }
  const trimmedTech = tech.trim();
  if (trimmedTech.length === 0) {
    return { valid: false, error: 'Tecnologia não pode estar vazia' };
  }
  if (trimmedTech.length > MAX_TECH_LENGTH) {
    return { valid: false, error: `Tecnologia demasiado longa (máximo ${MAX_TECH_LENGTH} caracteres)` };
  }
  // Sanitizar HTML
  const sanitized = sanitizeHtmlString(trimmedTech);
  if (sanitized.length === 0) {
    return { valid: false, error: 'Tecnologia inválida após sanitização' };
  }
  return { valid: true, sanitized };
};

// Validar e sanitizar array de tecnologias
export const validateAndSanitizeTechnologies = (technologies) => {
  if (!Array.isArray(technologies)) {
    return { valid: false, error: 'Tecnologias deve ser um array' };
  }
  const sanitized = [];
  const errors = [];
  
  for (const tech of technologies) {
    const result = validateAndSanitizeTechnology(tech);
    if (result.valid) {
      sanitized.push(result.sanitized);
    } else {
      errors.push(result.error);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, error: `Algumas tecnologias são inválidas: ${errors.join(', ')}` };
  }
  
  return { valid: true, sanitized };
};

// Validar URL (HTTP/HTTPS)
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) return true;
  
  // Verificar protocolo permitido
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  if (!urlPattern.test(trimmedUrl)) {
    return false;
  }
  
  // Verificar que não é javascript: ou data:
  if (/^(javascript:|data:|vbscript:|file:)/i.test(trimmedUrl)) {
    return false;
  }
  
  // Se não começa com http:// ou https://, adicionar https://
  if (!trimmedUrl.match(/^https?:\/\//i)) {
    return false;
  }
  
  return true;
};

// Validar e sanitizar caminho de imagem (caminho relativo /assets/)
export const validateAndSanitizeImagePath = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return { valid: true, sanitized: '' };
  }
  
  const trimmedPath = imagePath.trim();
  if (trimmedPath.length === 0) {
    return { valid: true, sanitized: '' };
  }
  
  // Verificar protocolo perigoso
  if (/^(javascript:|data:|vbscript:|file:)/i.test(trimmedPath)) {
    return { valid: false, error: 'Caminho da imagem contém protocolo perigoso' };
  }
  
  // Verificar eventos JavaScript
  if (/on\w+\s*=/i.test(trimmedPath)) {
    return { valid: false, error: 'Caminho da imagem contém código malicioso' };
  }
  
  // Validar caminho relativo /assets/
  if (!/^\/assets\/[a-zA-Z0-9._-]+\.(png|jpg|jpeg|gif|svg|webp)$/i.test(trimmedPath)) {
    return { valid: false, error: 'Caminho da imagem inválido. Deve ser /assets/nome_do_ficheiro' };
  }
  
  // Sanitizar HTML no caminho
  const sanitized = sanitizeHtmlString(trimmedPath);
  
  return { valid: true, sanitized };
};

// Validar e sanitizar URL (para GitHub e URLs externas)
export const validateAndSanitizeUrl = (url, fieldName = 'URL') => {
  if (!url || typeof url !== 'string') {
    return { valid: true, sanitized: '' };
  }
  
  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) {
    return { valid: true, sanitized: '' };
  }
  
  // Verificar protocolo perigoso
  if (/^(javascript:|data:|vbscript:|file:)/i.test(trimmedUrl)) {
    return { valid: false, error: `${fieldName} contém protocolo perigoso` };
  }
  
  // Verificar eventos JavaScript em URL
  if (/on\w+\s*=/i.test(trimmedUrl)) {
    return { valid: false, error: `${fieldName} contém código malicioso` };
  }
  
  // Validar formato de URL
  if (!isValidUrl(trimmedUrl)) {
    return { valid: false, error: `${fieldName} inválida. Deve começar com http:// ou https://` };
  }
  
  // Sanitizar HTML na URL
  const sanitized = sanitizeHtmlString(trimmedUrl);
  
  return { valid: true, sanitized };
};

// Encoding HTML (escape caracteres especiais)
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'\/]/g, (char) => map[char]);
};

// Validar Cargo
export const isValidRole = (role) => {
  const validRoles = ['admin', 'editor', 'guest'];
  return role && validRoles.includes(role);
};

// Constantes exportadas
export { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MIN_NAME_LENGTH };