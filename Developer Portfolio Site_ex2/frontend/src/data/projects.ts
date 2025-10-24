export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  links: { live?: string; repo?: string };
  image?: string;
};

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Tech Power Up',
    description:
      'Website E-Commerce completo desenvolvido com PHP e MySQL, oferecendo funcionalidades de exploração de produtos, carrinho de compras, checkout seguro e painel administrativo. Interface moderna construída com Bootstrap e JavaScript para uma experiência de utilizador otimizada.',
    tech: ['HTML', 'CSS', 'Bootstrap', 'JavaScript', 'PHP', 'MySQL'],
    links: { repo: 'https://github.com/git2026/desenvolvimento-web' },
    image: '/assets/projeto1.png',
  },
  {
    id: 'p2',
    title: 'Detação de Fake News',
    description:
      'Sistema avançado de detecção de fake news utilizando algoritmos de Machine Learning. Implementa múltiplos modelos de classificação incluindo Regressão Logística, SVM e Naive Bayes para análise precisa de conteúdo textual e identificação de notícias falsas.',
    tech: ['Python', 'scikit-learn', 'matplotlib', 'pandas', 'numpy', 'datasets'],
    links: { repo: 'https://github.com/git2026/inteligencia-artificial' },
    image: '/assets/projeto3.png',
  },
  {
    id: 'p3',
    title: 'UALFlix',
    description:
      'Plataforma de streaming de vídeos curtos baseada em arquitetura de microserviços. Desenvolvida com Flask, PostgreSQL e Redis, oferece serviços distribuídos de catálogo, streaming e interface web com suporte completo para Docker e Kubernetes. Sistema escalável com load balancing e gestão eficiente de recursos.',
    tech: ['Python', 'Flask', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    links: { repo: 'https://github.com/git2026/sistemas-distribuidos-paralelos' },
    image: '/assets/projeto2.png',
  },
  {
    id: 'p4',
    title: 'N em Linha',
    description:
      'Jogo "N em Linha" desenvolvido em Python com arquitetura MVC para gestão de jogadores e partidas. Inclui sistema de peças especiais, verificação de vitória em colunas/linhas/diagonais, persistência de dados em JSON e estatísticas completas de jogos e vitórias. Interface interativa com validação de jogadas e modo para múltiplos jogadores.',
    tech: ['Python', 'JSON', 'sys', 'time', 'os', 'MVC', 'Algoritmos'],
    links: { repo: 'https://github.com/git2026/algoritmia-programacao' },
    image: '/assets/projeto4.png',
  },
  {
    id: 'p5',
    title: 'Sistema de Reserva de Voos',
    description:
      'Sistema de gestão de reservas de voos com interface gráfica desenvolvido em Java Swing. Inclui reserva e gestão de assentos (executivos/econômicos), alteração e cancelamento de reservas, múltiplos métodos de pagamento e persistência de dados. Sistema de validação de NIF português e cálculo dinâmico de preços com extras.',
    tech: ['Java', 'Swing', 'Java I/O', 'Collections', 'POO', 'Serialização', 'Algoritmos'],
    links: { repo: 'https://github.com/git2026/programacao-orientada-objetos' },
    image: '/assets/projeto5.png',
  },
  {
    id: 'p6',
    title: 'Sistema de Gestão Mensal',
    description:
      'Sistema de gestão de despesas mensais com interface gráfica desenvolvido em Python Tkinter. Implementa arquitetura MVC com listas ligadas para armazenamento de dados. Inclui registo de utilizadores, gestão de despesas por categoria, definição de orçamento, filtros por data, ordenação múltipla e alertas de gastos. Validação de NIF português e persistência em JSON.',
    tech: ['Python', 'Tkinter', 'MVC', 'LinkedLists', 'JSON', 'tkcalendar', 'Algoritmos'],
    links: { repo: 'https://github.com/git2026/algoritmos-estruturas-dados' },
    image: '/assets/projeto6.png',
  },
];


