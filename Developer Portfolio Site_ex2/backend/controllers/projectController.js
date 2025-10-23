import { getAllProjects, createProject, getProjectById, updateProject, deleteProject } from '../models/projectModel.js';

export const getProjects = (req, res) => {
  try {
    const projects = getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const addProject = (req, res) => {
  try {
    const { title, description, technologies, image, github } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
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
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const getProject = (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const editProject = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, image, github } = req.body;

    // Validation - at least one field should be provided
    if (!title && !description && !technologies && image === undefined && github === undefined) {
      return res.status(400).json({ error: 'At least one field is required to update' });
    }

    const updatedProject = updateProject(id, {
      title,
      description,
      technologies,
      image,
      github
    });
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const removeProject = (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = deleteProject(id);
    
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
      project: deletedProject
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

