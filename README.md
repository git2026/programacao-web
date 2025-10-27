# Projeto de Programação Web

Desenvolvimento de Website Full Stack progressivo ao logo dos exercicios, disponibilizados em aula da disciplina Programação Web.

## 1. Ferramentas e Tecnologias Utilizadas

### Exercício 1 - Frontend

**Framework:** React 18 com TypeScript para desenvolvimento do frontend

**Build Tool:** Vite para desenvolvimento rápido e HMR

**Routing:** React Router DOM v6 para navegação SPA

**Estilização:** CSS Modules para componentes isolados

**Funcionalidades:** Sistema de temas com persistência em localStorage

### Exercício 2 - Backend + Full-Stack

**Runtime:** Node.js com Express para criação da API REST (ES Modules)

**Autenticação:** JSON Web Tokens (JWT) com expiração de 12 horas

**Segurança:** bcryptjs para hashing de passwords (10 rounds)

**Validação:** express-validator para validação de dados de entrada

**Autorização:** Sistema de roles (admin, editor, guest) com middleware de permissões

**Persistência:** Ficheiros JSON para armazenamento de dados (users.json, projects.json)

**Cache:** Sistema de cache com headers HTTP (5 minutos) e cache-busting para imagens

**LAN Access:** Configuração para acesso via rede local

**Testing:** Interface HTML interativa para testar endpoints

**Process Management:** Script automatizado (start.js) para iniciar frontend e backend simultaneamente com auto-instalação de dependências

**GitHub Integration:** Proxy para acesso a avatares do GitHub via frontend

## 2. Requisitos para Execução do Projeto

### Exercício 1 - Frontend

Comandos:
cd "Developer Portfolio Site_ex1/frontend"
npm install
npm run dev

URL Disponivel: http://localhost:5173

### Exercício 2 - Full-Stack

**Método Recomendado (Automático):**
cd "Developer Portfolio Site_ex2"
npm start

**Método Manual:**
cd "Developer Portfolio Site_ex2/backend"
npm install
npm start

cd "Developer Portfolio Site_ex2/frontend"  
npm install
npm run dev

**URLs Disponíveis:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Tester: http://localhost:5000/api-tester.html
- LAN Access: http://IP:5173 (frontend) e http://IP:5000 (backend)


## Estrutura do Projeto

```
programacao-web/
├── Developer Portfolio Site_ex1/    # Exercício 1
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/          # Header, Footer, ThemeToggle
│   │   │   ├── sections/            # About, Projects, Skills
│   │   │   ├── data/                # config.ts, profile.ts, projects.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css      # Estilos globais e variáveis CSS
│   │   │   ├── App.tsx              # Componente principal com routing
│   │   │   └── main.tsx             # Entry point
│   │   ├── public/
│   │   │   └── assets/              # Imagens (profile.svg, projeto1-6.png)
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│
│
├── Developer Portfolio Site_ex2/    # Exercício 2
│   ├── backend/
│   │   ├── config/
│   │   │   └── serverConfig.js      # Configuração do servidor e JWT
│   │   ├── controllers/
│   │   │   ├── authController.js    # Lógica de autenticação + import
│   │   │   └── projectController.js # Lógica de projetos
│   │   ├── data/
│   │   │   ├── projects.json        # Base de dados de projetos
│   │   │   └── users.json           # Base de dados de utilizadores
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # Verificação JWT
│   │   │   ├── roleMiddleware.js    # Verificação de roles
│   │   │   └── validationMiddleware.js # Validação de entrada
│   │   ├── models/
│   │   │   ├── userModel.js         # Modelo de utilizador
│   │   │   └── projectModel.js      # Modelo de projeto
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Rotas de autenticação
│   │   │   └── projectRoutes.js     # Rotas de projetos
│   │   ├── utils/
│   │   │   └── tokenUtils.js        # Utilidades JWT
│   │   ├── api-tester.html          # Interface de testes da API
│   │   ├── server.js                # Entry point
│   │   └── package.json             # type: "module"
│   ├── frontend/                    # Frontend React
│   │   ├── src/
│   │   │   ├── components/          # Header, Footer, ThemeToggle
│   │   │   ├── sections/            # About, Projects, Skills
│   │   │   ├── data/                # config.ts, profile.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css      # Estilos globais e variáveis CSS
│   │   │   ├── App.tsx              # Componente principal com routing
│   │   │   └── main.tsx             # Entry point
│   │   ├── public/
│   │   │   └── assets/              # Imagens (profile.svg, projeto1-6.png)
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts           # Config com proxy GitHub e build otimizado
│   ├── package.json                 # Root package.json
│   └── start.js                     # Script para iniciar frontend + backend
│
└── LICENSE                          # GNU v3.0
```

## Endpoints da API (Exercício 2)

**Autenticação:**
- `POST /api/auth/register` - Registar utilizador (público)
- `POST /api/auth/login` - Login (obtém JWT) (público)
- `GET /api/auth/dashboard` - Dashboard com informações do utilizador (autenticado)
- `GET /api/auth/users` - Listar todos os utilizadores (admin)
- `PUT /api/auth/users/:id` - Atualizar utilizador específico (admin)
- `DELETE /api/auth/users/:id` - Eliminar utilizador específico (admin)
- `DELETE /api/auth/users` - Limpar utilizadores (admin)
- `POST /api/auth/users/reset-ids` - Reiniciar IDs dos utilizadores (admin)
- `POST /api/auth/users/import` - Importar utilizadores (admin)

**Projetos:**
- `GET /api/projects` - Listar os projetos (público)
- `GET /api/projects/:id` - Obter projeto específico (público)
- `POST /api/projects` - Criar projeto (admin/editor)
- `PUT /api/projects/:id` - Atualizar projeto (admin/editor)
- `DELETE /api/projects/:id` - Eliminar projeto (admin)
- `DELETE /api/projects` - Limpar os projetos (admin)
- `POST /api/projects/reset-ids` - Reiniciar IDs dos projetos (admin)

**Sistema de Roles:**
- **admin:** Acesso total - CRUD completo de projetos e utilizadores, operações de reset e import
- **editor:** Criar e editar projetos
- **guest:** Apenas visualizar projetos

## Funcionalidades Principais

### Frontend (Exercício 2)
- **Integração com API:** Fetch automático de projetos do backend
- **Cache-busting:** Sistema para forçar atualização de imagens via timestamp
- **Loading States:** Estados de carregamento e feedback visual
- **Avatar GitHub:** Integração direta com API do GitHub para avatar via proxy Vite
- **Tema Persistente:** Sistema de temas com localStorage
- **Responsive Design:** Interface adaptável a diferentes dispositivos
- **Error Handling:** Tratamento de erros na comunicação com API

### Backend (Exercício 2)
- **Sistema de Cache:** Headers HTTP para controlo de cache (5 minutos) com ETag e Last-Modified
- **Serving de Assets:** Middleware para servir imagens estáticas com cache otimizado
- **LAN Access:** Configuração para acesso via rede local
- **Error Handling:** Tratamento robusto de erros e exceções em todas as rotas
- **API Testing:** Interface HTML completa para testes de endpoints
- **Validação de Dados:** Middleware express-validator para validação de entrada
- **Middleware Chain:** authMiddleware + roleMiddleware + validationMiddleware
- **Import em Lote:** Suporte para importar múltiplos utilizadores de uma vez

## Licença
GNU v3.0