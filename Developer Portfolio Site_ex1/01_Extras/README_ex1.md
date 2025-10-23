# Exercício 1 - Frontend do Portfólio

Desenvolvimento de um portfólio de desenvolvedor responsivo utilizando React, TypeScript e CSS Modules, com sistema de navegação e tema dark/light.

## 1. Ferramentas e Tecnologias Utilizadas

- **Linguagem**: TypeScript para type safety
- **Framework**: React 18 com hooks modernos
- **Build Tool**: Vite para desenvolvimento rápido e HMR
- **Routing**: React Router DOM v6 para navegação SPA
- **Estilização**: CSS Modules para componentes isolados
- **Type Checking**: TypeScript com configuração strict

## 2. Requisitos para Execução

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm start
```
Aceda ao portfólio em: http://localhost:5173

### Build de Produção
```bash
npm run build
```
Os ficheiros otimizados estarão em `dist/`

### Preview da Build
```bash
npm run preview
```

## 3. Estrutura do Frontend

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Header.module.css
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   └── Footer.module.css
│   ├── ThemeToggle/
│   │   ├── ThemeToggle.tsx
│   │   └── ThemeToggle.module.css
│   └── ScrollToTop.tsx   # Scroll automático no router
├── sections/             # Secções principais
│   ├── About/
│   │   ├── About.tsx
│   │   └── About.module.css
│   ├── Projects/
│   │   ├── Projects.tsx
│   │   └── Projects.module.css
│   └── Skills/
│       ├── Skills.tsx
│       └── Skills.module.css
├── data/                 # Dados tipados
│   ├── config.ts         # Configuração global
│   ├── profile.ts        # Informação do perfil
│   └── projects.ts       # Lista de projetos
├── styles/
│   └── globals.css       # Estilos globais e variáveis CSS
├── types/
│   └── css-modules.d.ts  # Type definitions para CSS Modules
├── App.tsx               # Componente raiz com routing
└── main.tsx              # Entry point da aplicação
```

## 4. Funcionalidades Implementadas

### ✅ Layout Responsivo
- Design mobile-first
- Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Grid e flexbox para layouts adaptativos

### ✅ Sistema de Temas
- Toggle dark/light mode
- Persistência em localStorage
- Transições suaves entre temas
- Variáveis CSS para cores dinâmicas

### ✅ Navegação
- React Router com 3 rotas principais
- Links ativos com estilos diferenciados
- Scroll to top automático na mudança de rota
- Navegação SPA sem recarregamento

### ✅ Secções Principais

**About** (`/`)
- Informação pessoal e profissional
- Avatar/foto de perfil
- Descrição e objetivos

**Projects** (`/projects`)
- Grid de projetos com imagens
- Informação: título, descrição, tecnologias
- Links para demo e GitHub
- Efeitos hover

**Skills** (`/skills`)
- Lista de competências técnicas
- Organização por categorias
- Design visual atrativo

### ✅ Componentes TypeScript
- Props totalmente tipadas
- Interfaces para dados (Profile, Project, Skill)
- Type checking em desenvolvimento

### ✅ CSS Modules
- Estilos encapsulados por componente
- Sem conflitos de nomes de classes
- Melhor manutenibilidade

## 5. Personalização

### Dados do Perfil
Edite `src/data/profile.ts`:
```typescript
export const profile = {
  name: "Seu Nome",
  title: "Seu Título",
  bio: "Sua biografia...",
  // ...
};
```

### Projetos
Edite `src/data/projects.ts`:
```typescript
export const projects = [
  {
    id: 1,
    title: "Nome do Projeto",
    description: "Descrição...",
    technologies: ["React", "TypeScript"],
    // ...
  },
];
```

### Temas e Cores
Edite variáveis CSS em `src/styles/globals.css`:
```css
:root {
  --primary-color: #seu-valor;
  --background-color: #seu-valor;
  /* ... */
}
```

### Imagens
Substitua os ficheiros em `public/assets/`:
- `profile.svg` - Foto de perfil
- `projeto1.png` até `projeto6.png` - Screenshots dos projetos

## 6. Configuração Vite

O projeto utiliza Vite com as seguintes otimizações:
- **HMR**: Hot Module Replacement para desenvolvimento rápido
- **Asset optimization**: Imagens otimizadas automaticamente
- **Code splitting**: Separação automática de código
- **Cache headers**: Headers configurados para cache de 7 dias

Ver `vite.config.ts` para detalhes.

## 7. Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção otimizada |
| `npm run preview` | Preview da build de produção |

## 8. Browser Support

- Chrome (últimas 2 versões)
- Firefox (últimas 2 versões)
- Safari (últimas 2 versões)
- Edge (últimas 2 versões)

## Licença

MIT

