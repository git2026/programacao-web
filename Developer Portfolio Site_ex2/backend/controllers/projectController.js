import { getAllProjects, createProject, getProjectById, updateProject, deleteProject } from '../models/projectModel.js';

export const getProjects = (req, res) => {
  try {
    const projects = getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao carregar projetos' });
  }
};

export const addProject = (req, res) => {
  try {
    const { title, description, technologies, image, github } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    const project = createProject({
      title,
      description,
      technologies: technologies || [],
      image: image || '',
      github: github || '',
      createdBy: req.user.email
    });

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar projeto' });
  }
};

export const getProject = (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao carregar projeto' });
  }
};

export const editProject = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, image, github } = req.body;

    // Validation - at least one field should be provided
    if (!title && !description && !technologies && image === undefined && github === undefined) {
      return res.status(400).json({ error: 'Pelo menos um campo é obrigatório para atualizar' });
    }

    const updatedProject = updateProject(id, {
      title,
      description,
      technologies,
      image,
      github
    });
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({
      message: 'Projeto atualizado com sucesso',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar projeto' });
  }
};

export const removeProject = (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = deleteProject(id);
    
    if (!deletedProject) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({
      message: 'Projeto eliminado com sucesso',
      project: deletedProject
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao eliminar projeto' });
  }
};

