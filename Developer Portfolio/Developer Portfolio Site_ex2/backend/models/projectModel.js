import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectsFilePath = path.join(__dirname, '../data/projects.json');

// Inicializar ficheiro de projetos se não existir
if (!fs.existsSync(path.dirname(projectsFilePath))) {
  fs.mkdirSync(path.dirname(projectsFilePath), { recursive: true });
}

if (!fs.existsSync(projectsFilePath)) {
  fs.writeFileSync(projectsFilePath, JSON.stringify([], null, 2));
}

let nextProjectId = 1;
const freedProjectIds = [];

// Obter próximo ID de projeto disponível
const getNextProjectId = () => {
  if (freedProjectIds.length > 0) {
    return freedProjectIds.pop();
  }
  return nextProjectId++;
};

// Inicializar nextProjectId com base nos projetos existentes
const initializeProjectId = () => {
  const projects = getAllProjects();
  if (projects.length > 0) {
    const maxId = Math.max(...projects.map(p => parseInt(p.id) || 0));
    nextProjectId = maxId + 1;
  }
};

export const getAllProjects = () => {
  const data = fs.readFileSync(projectsFilePath, 'utf-8');
  return JSON.parse(data);
};

export const createProject = (project) => {
  const projects = getAllProjects();
  const newProject = {
    id: getNextProjectId().toString(),
    ...project,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
  return newProject;
};

export const getProjectById = (id) => {
  const projects = getAllProjects();
  return projects.find(project => project.id === id);
};

export const updateProject = (id, updates) => {
  const projects = getAllProjects();
  const project = projects.find(project => project.id === id);
  
  if (project) {
    // Atualizar apenas campos fornecidos
    if (updates.title) project.title = updates.title;
    if (updates.description) project.description = updates.description;
    if (updates.technologies) project.technologies = updates.technologies;
    if (updates.image !== undefined) project.image = updates.image;
    if (updates.github !== undefined) project.github = updates.github;
    project.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
    return project;
  }
  return null;
};

export const deleteProject = (id) => {
  const projects = getAllProjects();
  const index = projects.findIndex(project => project.id === id);
  if (index !== -1) {
    const deletedProject = projects.splice(index, 1)[0];
    freedProjectIds.push(parseInt(id));
    freedProjectIds.sort((a, b) => b - a); // Manter ordenado descendente
    fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2));
    return deletedProject;
  }
  return null;
};

export const clearAllProjects = () => {
  fs.writeFileSync(projectsFilePath, JSON.stringify([], null, 2));
  nextProjectId = 1;
  freedProjectIds.length = 0;
  return { message: 'Todos os projetos foram eliminados' };
};

export const resetProjectIds = () => {
  const projects = getAllProjects();
  
  if (projects.length === 0) {
    return { message: 'Não há projetos para resetar IDs', count: 0 };
  }
  
  // Reiniciar IDs iterativamente de 1 até o número total de projetos
  const resetProjects = projects.map((project, index) => ({
    ...project,
    id: (index + 1).toString()
  }));
  
  // Reiniciar contadores
  nextProjectId = resetProjects.length + 1;
  freedProjectIds.length = 0;
  
  // Guardar no ficheiro
  fs.writeFileSync(projectsFilePath, JSON.stringify(resetProjects, null, 2));
  
  return { 
    message: `IDs dos projetos foram reiniciados sequencialmente (1-${resetProjects.length})`, 
    count: resetProjects.length,
    ids: resetProjects.map(p => p.id)
  };
};

// Inicializar ao carregar o módulo
initializeProjectId();