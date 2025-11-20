import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  clearAllProjects,
  resetProjectIds,
  importProjectsFromArray
} from '../models/projectModel.js';
import { sendError } from '../utils/errorHandler.js';
import {
  validateAndSanitizeTitle,
  validateAndSanitizeDescription,
  validateAndSanitizeTechnologies,
  validateAndSanitizeImagePath,
  validateAndSanitizeUrl
} from '../utils/validation.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error) {
    sendError(res, 500, 'Erro ao carregar projetos', error.message);
  }
};

export const addProject = async (req, res) => {
  try {
    const { title, description, technologies, image, github } = req.body;

    // Validar e sanitizar título
    const titleValidation = validateAndSanitizeTitle(title);
    if (!titleValidation.valid) {
      return sendError(res, 400, titleValidation.error);
    }

    // Validar e sanitizar descrição
    const descriptionValidation = validateAndSanitizeDescription(description);
    if (!descriptionValidation.valid) {
      return sendError(res, 400, descriptionValidation.error);
    }

    // Validar e sanitizar tecnologias
    const techValidation = validateAndSanitizeTechnologies(technologies || []);
    if (!techValidation.valid) {
      return sendError(res, 400, techValidation.error);
    }

    // Validar e sanitizar caminho da imagem
    const imageValidation = validateAndSanitizeImagePath(image);
    if (!imageValidation.valid) {
      return sendError(res, 400, imageValidation.error);
    }

    // Validar e sanitizar URL do GitHub
    const githubValidation = validateAndSanitizeUrl(github, 'URL do GitHub');
    if (!githubValidation.valid) {
      return sendError(res, 400, githubValidation.error);
    }

    const project = await createProject({
      title: titleValidation.sanitized,
      description: descriptionValidation.sanitized,
      technologies: techValidation.sanitized,
      image: imageValidation.sanitized || null,
      github: githubValidation.sanitized || null,
      createdBy: req.user ? req.user.name : null,
      user_id: req.user ? req.user.id : null
    });

    res.status(201).json({ message: 'Criado com sucesso', project });
  } catch (error) {
    sendError(res, 500, 'Erro ao criar projeto', error.message);
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    
    if (!project) {
      return sendError(res, 404, 'Projeto não encontrado', `Projeto com ID ${req.params.id} não existe`);
    }

    res.json(project);
  } catch (error) {
    sendError(res, 500, 'Erro ao carregar projeto', error.message);
  }
};

export const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, image, github } = req.body;

    if (!title && !description && !technologies && image === undefined && github === undefined) {
      return sendError(res, 400, 'Deve fornecer pelo menos um campo para atualizar');
    }

    const updates = {};

    // Validar e sanitizar título se fornecido
    if (title !== undefined) {
      const titleValidation = validateAndSanitizeTitle(title);
      if (!titleValidation.valid) {
        return sendError(res, 400, titleValidation.error);
      }
      updates.title = titleValidation.sanitized;
    }

    // Validar e sanitizar descrição se fornecido
    if (description !== undefined) {
      const descriptionValidation = validateAndSanitizeDescription(description);
      if (!descriptionValidation.valid) {
        return sendError(res, 400, descriptionValidation.error);
      }
      updates.description = descriptionValidation.sanitized;
    }

    // Validar e sanitizar tecnologias se fornecido
    if (technologies !== undefined) {
      const techValidation = validateAndSanitizeTechnologies(technologies);
      if (!techValidation.valid) {
        return sendError(res, 400, techValidation.error);
      }
      updates.technologies = techValidation.sanitized;
    }

    // Validar e sanitizar caminho da imagem se fornecido
    if (image !== undefined) {
      const imageValidation = validateAndSanitizeImagePath(image);
      if (!imageValidation.valid) {
        return sendError(res, 400, imageValidation.error);
      }
      updates.image = imageValidation.sanitized || null;
    }

    // Validar e sanitizar URL do GitHub se fornecido
    if (github !== undefined) {
      const githubValidation = validateAndSanitizeUrl(github, 'URL do GitHub');
      if (!githubValidation.valid) {
        return sendError(res, 400, githubValidation.error);
      }
      updates.github = githubValidation.sanitized || null;
    }

    const updatedProject = await updateProject(id, updates);
    
    if (!updatedProject) {
      return sendError(res, 404, 'Projeto não encontrado', `Projeto com ID ${id} não existe`);
    }

    res.json({ message: 'Atualizado com sucesso', project: updatedProject });
  } catch (error) {
    sendError(res, 500, 'Erro ao atualizar', error.message);
  }
};

export const removeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await deleteProject(id);
    
    if (!deletedProject) {
      return sendError(res, 404, 'Projeto não encontrado', `Projeto com ID ${id} não existe`);
    }

    res.json({ message: 'Eliminado com sucesso', project: deletedProject });
  } catch (error) {
    sendError(res, 500, 'Erro ao eliminar', error.message);
  }
};

export const clearProjects = async (req, res) => {
  try {
    const result = await clearAllProjects();
    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Erro ao limpar projetos', error.message);
  }
};

export const resetProjectsIds = async (req, res) => {
  try {
    const result = await resetProjectIds();
    res.json(result);
  } catch (error) {
    sendError(res, 500, 'Erro ao reiniciar IDs', error.message);
  }
};

// Importar projetos de JSON para MySQL
export const importProjects = async (req, res) => {
  try {
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return sendError(res, 400, 'Array de projetos necessário');
    }

    const result = await importProjectsFromArray(projects);

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

// Exportar projetos de MySQL para JSON
export const exportProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error) {
    sendError(res, 500, 'Erro na exportação', error.message);
  }
};

// Obter competências organizadas por importância (sistema de scoring)
export const getSkills = async (req, res) => {
  try {
    const projects = await getAllProjects();
    
    if (!Array.isArray(projects) || projects.length === 0) {
      return res.json({ primary: [], secondary: [] });
    }

    // Contar frequência de cada tecnologia
    const techCount = {};
    projects.forEach((project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech) => {
          const normalizedTech = tech.trim();
          if (normalizedTech) {
            techCount[normalizedTech] = (techCount[normalizedTech] || 0) + 1;
          }
        });
      }
    });

    // Categorias de tecnologias com pesos (Core=10, Frontend=9, Backend=8, etc.)
    const techCategories = {
      'Core': { weight: 10, techs: ['JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'HTML', 'CSS'] },
      'Frontend': { weight: 9, techs: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'Bootstrap', 'Tailwind', 'SASS', 'SCSS'] },
      'Backend': { weight: 8, techs: ['Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Laravel', 'Symfony', 'ASP.NET'] },
      'Database': { weight: 7, techs: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'MariaDB', 'Oracle', 'SQL Server'] },
      'DataScience': { weight: 6, techs: ['scikit-learn', 'TensorFlow', 'PyTorch', 'pandas', 'numpy', 'matplotlib', 'datasets', 'Jupyter'] },
      'DevOps': { weight: 5, techs: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD'] },
      'Mobile': { weight: 4, techs: ['React Native', 'Flutter', 'Ionic', 'Cordova', 'Swift', 'Kotlin'] },
      'Tools': { weight: 3, techs: ['Webpack', 'Vite', 'npm', 'yarn', 'Figma', 'Photoshop', 'Illustrator', 'VS Code'] }
    };

    // Calcular score: frequência + peso da categoria + posição na lista
    const calculateTechScore = (tech, count) => {
      for (const [categoryName, categoryData] of Object.entries(techCategories)) {
        const index = categoryData.techs.findIndex(t => t.toLowerCase() === tech.toLowerCase());
        if (index !== -1) {
          return {
            score: count * 100 + categoryData.weight * 10 + (categoryData.techs.length - index),
            category: categoryName,
            weight: categoryData.weight,
            count
          };
        }
      }
      return { score: count * 100, category: 'Other', weight: 1, count };
    };

    // Ordenar por score (maior = mais importante)
    const sortedTechs = Object.entries(techCount)
      .map(([tech, count]) => ({ name: tech, ...calculateTechScore(tech, count) }))
      .sort((a, b) => b.score - a.score);

    // Dividir em principais (top 40% ou 2+ usos) e secundárias
    const totalTechs = sortedTechs.length;
    const primaryCount = Math.max(6, Math.min(12, Math.ceil(totalTechs * 0.4)));
    const minUsageForPrimary = Math.max(2, Math.ceil(projects.length * 0.25));
    
    const primary = sortedTechs
      .filter(t => t.count >= minUsageForPrimary || sortedTechs.indexOf(t) < primaryCount)
      .slice(0, 12)
      .map(t => t.name);
    
    const secondary = sortedTechs
      .filter(t => !primary.includes(t.name))
      .slice(0, 20)
      .map(t => t.name);

    res.json({
      primary,
      secondary,
      stats: {
        totalProjects: projects.length,
        totalTechnologies: sortedTechs.length,
        primaryCount: primary.length,
        secondaryCount: secondary.length,
        topTechnologies: sortedTechs.slice(0, 10).map(t => ({ 
          name: t.name, 
          count: t.count, 
          category: t.category,
          score: Math.round(t.score)
        }))
      }
    });
  } catch (error) {
    sendError(res, 500, 'Erro ao obter competências', error.message);
  }
};