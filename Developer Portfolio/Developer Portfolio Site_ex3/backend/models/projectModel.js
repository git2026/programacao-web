import { pool } from '../db.js';
import {
  validateAndSanitizeTitle,
  validateAndSanitizeDescription,
  validateAndSanitizeTechnologies,
  validateAndSanitizeImagePath,
  validateAndSanitizeUrl
} from '../utils/validation.js';

// Obter todos os projetos
export const getAllProjects = async () => {
  const [rows] = await pool.query('SELECT * FROM projects ORDER BY id ASC');
  return rows.map(row => ({
    ...row,
    technologies: row.tech ? row.tech.split(', ').map(t => t.trim()) : []
  }));
};

// Criar projeto
export const createProject = async (projectData) => {
  const { title, description, tech, user_id, technologies, image, github, createdBy } = projectData;
  
  const techString = Array.isArray(technologies) ? technologies.join(', ') : (tech || '');
  
  // Garantir IDs sequenciais corrigindo AUTO_INCREMENT se necessário
  const [maxResult] = await pool.query('SELECT MAX(id) as maxId FROM projects');
  const maxId = maxResult[0].maxId || 0;
  const nextId = maxId + 1;
  
  const [autoIncResult] = await pool.query('SHOW TABLE STATUS LIKE "projects"');
  const currentAutoInc = autoIncResult[0]?.Auto_increment || nextId;
  
  if (currentAutoInc > nextId + 1) {
    await pool.query(`ALTER TABLE projects AUTO_INCREMENT = ${nextId}`);
  }
  
  const [result] = await pool.query(
    'INSERT INTO projects (title, description, tech, image, github, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, techString, image || null, github || null, user_id || null]
  );
  
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
  
  if (rows[0]) {
    rows[0].technologies = rows[0].tech ? rows[0].tech.split(', ').map(t => t.trim()) : [];
  }
  
  return rows[0] || {
    id: result.insertId,
    title,
    description,
    tech: techString,
    technologies: Array.isArray(technologies) ? technologies : (techString ? techString.split(', ').map(t => t.trim()) : []),
    image: image || null,
    github: github || null,
    user_id,
    createdBy: createdBy || null
  };
};

// Obter projeto por ID
export const getProjectById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
  if (rows[0]) {
    rows[0].technologies = rows[0].tech ? rows[0].tech.split(', ').map(t => t.trim()) : [];
  }
  return rows[0] || null;
};

// Atualizar projeto
export const updateProject = async (id, updates) => {
  const { title, description, tech, technologies, user_id, image, github } = updates;
  const fields = [];
  const values = [];
  
  if (title) {
    fields.push('title = ?');
    values.push(title);
  }
  if (description) {
    fields.push('description = ?');
    values.push(description);
  }
  if (tech !== undefined || technologies !== undefined) {
    fields.push('tech = ?');
    const techString = Array.isArray(technologies) ? technologies.join(', ') : (tech || '');
    values.push(techString);
  }
  if (image !== undefined) {
    fields.push('image = ?');
    values.push(image || null);
  }
  if (github !== undefined) {
    fields.push('github = ?');
    values.push(github || null);
  }
  if (user_id !== undefined) {
    fields.push('user_id = ?');
    values.push(user_id);
  }
  
  if (fields.length === 0) return null;
  
  values.push(id);
  await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
  
  return await getProjectById(id);
};

// Eliminar projeto
export const deleteProject = async (id) => {
  const project = await getProjectById(id);
  if (!project) return null;
  
  await pool.query('DELETE FROM projects WHERE id = ?', [id]);
  return project;
};

// Limpar todos os projetos
export const clearAllProjects = async () => {
  await pool.query('DELETE FROM projects');
  await pool.query('ALTER TABLE projects AUTO_INCREMENT = 1');
  return { message: 'Todos os projetos foram eliminados' };
};

// Reorganizar IDs para sequenciais (1, 2, 3...) usando transação
export const resetProjectIds = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [projects] = await connection.query(
      'SELECT id, title FROM projects ORDER BY created_at ASC'
    );
  
    if (projects.length === 0) {
      await connection.commit();
      connection.release();
      return { message: 'Não há projetos para reorganizar', count: 0 };
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('SET UNIQUE_CHECKS = 0');
    
    // Atribuir IDs temporários negativos
    for (let i = 0; i < projects.length; i++) {
      const tempId = -(i + 1);
      await connection.query('UPDATE projects SET id = ? WHERE id = ?', [tempId, projects[i].id]);
    }
    
    // Atribuir IDs finais sequenciais
    for (let i = 0; i < projects.length; i++) {
      const newId = i + 1;
      await connection.query('UPDATE projects SET id = ? WHERE id = ?', [newId, -(i + 1)]);
    }
    
    const nextId = projects.length + 1;
    await connection.query(`ALTER TABLE projects AUTO_INCREMENT = ${nextId}`);
    
    await connection.query('SET UNIQUE_CHECKS = 1');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    
    const [reorganizedProjects] = await connection.query(
      'SELECT id, title FROM projects ORDER BY id ASC'
    );
    
    connection.release();
  
    return { 
      message: `IDs reorganizados com sucesso! Projetos agora têm IDs de 1 a ${reorganizedProjects.length}`,
      count: reorganizedProjects.length,
      nextId: nextId,
      projects: reorganizedProjects.map(p => ({ id: p.id, title: p.title }))
    };
  } catch (error) {
    await connection.rollback();
    await connection.query('SET UNIQUE_CHECKS = 1');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    throw new Error(`Falha ao reorganizar IDs: ${error.message}`);
  }
};

// Importar projetos de array
export const importProjectsFromArray = async (projectsArray) => {
  let imported = 0;
  let errors = 0;
  const errorMessages = [];

  for (const projectData of projectsArray) {
    try {
      // Validar campos obrigatórios
      if (!projectData.title || !projectData.description) {
        errors++;
        errorMessages.push(`${projectData.title || 'Unknown'}: Faltam campos obrigatórios (title, description)`);
        continue;
      }

      // Validar e sanitizar título
      const titleValidation = validateAndSanitizeTitle(projectData.title);
      if (!titleValidation.valid) {
        errors++;
        errorMessages.push(`${projectData.title || 'Unknown'}: ${titleValidation.error}`);
        continue;
      }

      // Validar e sanitizar descrição
      const descriptionValidation = validateAndSanitizeDescription(projectData.description);
      if (!descriptionValidation.valid) {
        errors++;
        errorMessages.push(`${projectData.title || 'Unknown'}: ${descriptionValidation.error}`);
        continue;
      }

      // Validar e sanitizar tecnologias
      const techValidation = validateAndSanitizeTechnologies(projectData.technologies || []);
      if (!techValidation.valid) {
        errors++;
        errorMessages.push(`${projectData.title || 'Unknown'}: ${techValidation.error}`);
        continue;
      }

      // Validar e sanitizar caminho da imagem (opcional)
      let image = null;
      if (projectData.image) {
        const imageValidation = validateAndSanitizeImagePath(projectData.image);
        if (!imageValidation.valid) {
          errors++;
          errorMessages.push(`${projectData.title || 'Unknown'}: ${imageValidation.error}`);
          continue;
        }
        image = imageValidation.sanitized;
      }

      let github = null;
      if (projectData.github) {
        const githubValidation = validateAndSanitizeUrl(projectData.github, 'URL do GitHub');
        if (!githubValidation.valid) {
          errors++;
          errorMessages.push(`${projectData.title || 'Unknown'}: ${githubValidation.error}`);
          continue;
        }
        github = githubValidation.sanitized;
      }

      // Criar projeto com dados sanitizados
      await createProject({
        title: titleValidation.sanitized,
        description: descriptionValidation.sanitized,
        technologies: techValidation.sanitized,
        image,
        github,
        user_id: projectData.user_id || null,
        createdBy: projectData.createdBy || null
      });

      imported++;
    } catch (error) {
      errors++;
      errorMessages.push(`${projectData.title || 'Unknown'}: ${error.message}`);
    }
  }

  return { imported, errors, errorMessages };
};