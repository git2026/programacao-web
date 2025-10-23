import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectsFilePath = path.join(__dirname, '../data/projects.json');

// Initialize projects file if it doesn't exist
if (!fs.existsSync(path.dirname(projectsFilePath))) {
  fs.mkdirSync(path.dirname(projectsFilePath), { recursive: true });
}

if (!fs.existsSync(projectsFilePath)) {
  fs.writeFileSync(projectsFilePath, JSON.stringify([], null, 2));
}

export const getAllProjects = () => {
  const data = fs.readFileSync(projectsFilePath, 'utf-8');
  return JSON.parse(data);
};

export const createProject = (project) => {
  const projects = getAllProjects();
  const newProject = {
    id: Date.now().toString(),
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

