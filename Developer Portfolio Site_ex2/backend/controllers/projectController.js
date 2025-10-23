import { getAllProjects, createProject, getProjectById } from '../models/projectModel.js';

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
    const { title, description, technologies, image, link, github } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const project = createProject({
      title,
      description,
      technologies: technologies || [],
      image: image || '',
      link: link || '',
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

