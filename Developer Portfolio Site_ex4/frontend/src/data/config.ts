// Configurações gerais da aplicação
export const APP_CONFIG = {
  name: 'Developer Portfolio',
  version: '1.0.0',
  url: 'https://github.com/git2026',
  // API URL: proxy em dev, VITE_API_URL ou detecção automática em produção
  apiUrl: (() => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.DEV) {
      return ''; // Proxy do Vite
    }
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
      }
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return 'http://localhost:5000';
  })(),
  theme: {
    default: 'dark',
    storageKey: 'portfolio-theme',
  },
  navigation: {
    defaultRoute: '/projects',
    routes: [
      { path: '/projects', label: 'Projetos' },
      { path: '/skills', label: 'Competências' },
      { path: '/about', label: 'Sobre' },
    ],
  },
  cache: {
    profileImage: {
      preload: true,
      loading: 'eager' as const,
    },
  },
} as const;