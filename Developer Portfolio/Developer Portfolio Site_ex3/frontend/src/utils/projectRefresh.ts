// Utilitário para refresh de projetos (separado para evitar problemas com Fast Refresh)

let globalRefreshProjects: (() => void) | null = null;

export const setGlobalRefreshProjects = (fn: () => void) => {
  globalRefreshProjects = fn;
};

export const refreshProjects = () => {
  if (globalRefreshProjects) {
    globalRefreshProjects();
  }
};

