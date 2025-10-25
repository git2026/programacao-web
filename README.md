# Projeto de Programação Web

Desenvolvimento de Website Full Stack progressivo ao logo dos exercicios, 
disponibilizados em aula.

## 1. Ferramentas e Tecnologias Utilizadas

### Exercício 1 - Frontend

**Framework:** React 18 com TypeScript para desenvolvimento do frontend

**Build Tool:** Vite para desenvolvimento rápido e HMR

**Routing:** React Router DOM v6 para navegação SPA

**Estilização:** CSS Modules para componentes isolados

**Funcionalidades:** Sistema de temas dark/light com persistência em localStorage

### Exercício 2 - Backend + Full-Stack

**Runtime:** Node.js com Express para criação da API REST

**Autenticação:** JSON Web Tokens (JWT) com expiração de 24 horas

**Segurança:** bcryptjs para hashing de passwords (10 rounds)

**Validação:** express-validator para validação de dados de entrada

**Autorização:** Sistema de roles (admin, editor, guest)

**Persistência:** Ficheiros JSON para armazenamento de dados (users.json, projects.json)

**Testing:** Interface HTML interativa (api-tester.html) para testar endpoints

## 2. Requisitos para Execução do Projeto

### Exercício 1 - Frontend

Comandos:
cd "Developer Portfolio Site_ex1/frontend"
npm install
npm run dev

URL Disponivel: http://localhost:5173

### Exercício 2 - Backend

Comandos:
cd "Developer Portfolio Site_ex2/backend"
npm install
npm start

Executará o Frontend/Backend:

URL Frontend: http://localhost:5173
URL Backend: http://localhost:5000/api-tester.html


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
│   │   │   ├── authController.js    # Lógica de autenticação
│   │   │   └── projectController.js # Lógica de projetos
│   │   ├── data/
│   │   │   ├── projects.json        # Base de dados de projetos
│   │   │   └── users.json           # Base de dados de utilizadores
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # Verificação JWT
│   │   │   ├── roleMiddleware.js    # Verificação de roles
│   │   │   └── validationMiddleware.js
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
│   │   └── package.json
│   ├── frontend/                    # Frontend React (evolução do Ex1)
│   └── start.js                     # Script para iniciar frontend + backend
│
└── LICENSE                          # GNU v3.0
```

## Endpoints da API (Exercício 2)

**Autenticação:**
- `POST /api/auth/register` - Registar utilizador
- `POST /api/auth/login` - Login (obtém JWT)
- `GET /api/auth/dashboard` - Dashboard (protegido)
- `GET /api/auth/users` - Listar utilizadores (admin)
- `PUT /api/auth/users/:id` - Atualizar utilizador (admin)
- `DELETE /api/auth/users/:id` - Eliminar utilizador (admin)

**Projetos:**
- `GET /api/projects` - Listar todos os projetos (público)
- `GET /api/projects/:id` - Obter projeto específico (público)
- `POST /api/projects` - Criar projeto (admin/editor)
- `PUT /api/projects/:id` - Atualizar projeto (admin/editor)
- `DELETE /api/projects/:id` - Eliminar projeto (admin)

**Sistema de Roles:**
- **admin:** Acesso total - CRUD completo de projetos e utilizadores
- **editor:** Criar e editar projetos
- **guest:** Apenas visualizar projetos

## Licença
GNU General Public License v3.0