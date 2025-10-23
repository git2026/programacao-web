// Configurações gerais da aplicação
export const APP_CONFIG = {
  name: 'Developer Portfolio',
  version: '1.0.0',
  description: 'Portfolio pessoal de Guilherme Carvalho',
  author: 'Guilherme Carvalho',
  url: 'https://github.com/git2026',
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
