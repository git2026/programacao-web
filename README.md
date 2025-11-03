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

### Exercício 3 - Backend + Full-Stack com MySQL

**Runtime:** Node.js com Express para criação da API REST (ES Modules)

**Base de Dados:** MySQL com mysql2/promise para operações assíncronas, com tabelas para os utilizadores e os projetos

**Autenticação:** JSON Web Tokens (JWT) com expiração de 12 horas

**Segurança:** 
- Argon2 para hashing de passwords (configuração máxima de segurança: 128 MB memory, 5 iterações)
- Validação de password (12 a 20 caracteres)
- Validação de nome mínima (5 caracteres)
- Proteção XSS avançada: Sanitização HTML completa, validação de URLs, proteção contra eventos JavaScript
- Validação de email
- Normalização de dados (lowercase, trim)

**Persistência:** Base de dados MySQL com pool de conexões otimizado

**Import/Export:** Funcionalidade para importar e exportar dados entre JSON e MySQL

**Skills Organization:** Sistema inteligente de organização de competências com scoring baseado em frequência e categoria

**API URL:** Configuração dinâmica com proxy Vite em desenvolvimento e detecção automática de ambientes em produção através do .env

**Error Handling:** Tratamento centralizado de erros com detalhes condicionais (apenas em modo desenvolvimento)

**Mobile Responsive:** Layout otimizado para dispositivos móveis

**Process Management:** Script automatizado (start.js) para iniciar frontend e backend simultaneamente

## 2. Requisitos para Execução do Projeto

### Exercício 1 - Frontend

Comandos:
cd "Developer Portfolio Site_ex1/frontend"
npm install
npm run dev

### Exercício 2 - Full-Stack

Comandos:
cd "Developer Portfolio Site_ex2"
npm start

**URLs Disponíveis:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Tester: http://localhost:5000/api-tester.html
- LAN Access: http://IP:5173 (frontend) e http://IP:5000 (backend)

### Exercício 3 - Full-Stack com MySQL

**Pré-requisitos:**
- MySQL instalado e em execução
- Base de dados criada (executar `SQL_BD.sql`)

Comandos:
cd "Developer Portfolio Site_ex3"
npm start

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
├── Developer Portfolio Site_ex3/    # Exercício 3
│   ├── backend/
│   │   ├── controllers/
│   │   │   ├── authController.js    # Lógica de autenticação
│   │   │   └── projectController.js # Lógica de projetos e skills
│   │   ├── models/
│   │   │   ├── userModel.js         # Modelo de utilizador (MySQL)
│   │   │   └── projectModel.js      # Modelo de projeto (MySQL)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # Verificação JWT
│   │   │   └── roleMiddleware.js    # Verificação de roles
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Rotas de autenticação
│   │   │   └── projectRoutes.js     # Rotas de projetos
│   │   ├── utils/
│   │   │   ├── validation.js        # Validações de segurança
│   │   │   ├── errorHandler.js      # Tratamento centralizado de erros
│   │   │   └── tokenUtils.js        # Utilidades JWT
│   │   ├── db.js                    # Pool de conexões MySQL
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
│   │   └── vite.config.ts           # Config com proxy API e GitHub
│   ├── SQL_BD.sql                   # Script de criação da base de dados
│   ├── package.json                 # Root package.json
│   └── start.js                     # Script para iniciar frontend + backend
│
└── LICENSE                          # GNU v3.0
```

## Endpoints da API

### Exercício 2 e 3 (compatíveis)

**Autenticação:**
- `POST /api/auth/register` - Registar utilizador (público)
- `POST /api/auth/login` - Login (obtém JWT) (público)
- `GET /api/auth/dashboard` - Dashboard com informações do utilizador (autenticado)
- `GET /api/auth/users` - Listar todos os utilizadores (admin)
- `GET /api/auth/users/export` - Exportar utilizadores com passwords hasheadas (admin)
- `PUT /api/auth/users/:id` - Atualizar utilizador específico (admin)
- `DELETE /api/auth/users/:id` - Eliminar utilizador específico (admin)
- `DELETE /api/auth/users` - Limpar utilizadores (admin)
- `POST /api/auth/users/reset-ids` - Reorganizar IDs dos utilizadores (admin)
- `POST /api/auth/users/import` - Importar utilizadores de JSON para MySQL (admin)

**Projetos:**
- `GET /api/projects` - Listar os projetos (público)
- `GET /api/projects/:id` - Obter projeto específico (público)
- `GET /api/projects/skills` - Obter competências organizadas por importância (público)
- `GET /api/projects/export` - Exportar projetos de MySQL para JSON (público)
- `POST /api/projects` - Criar projeto (admin/editor)
- `POST /api/projects/import` - Importar projetos de JSON para MySQL (admin/editor)
- `PUT /api/projects/:id` - Atualizar projeto (admin/editor)
- `DELETE /api/projects/:id` - Eliminar projeto (admin)
- `DELETE /api/projects` - Limpar os projetos (admin)
- `POST /api/projects/reset-ids` - Reorganizar IDs dos projetos (admin)

**Sistema de Roles:**
- **admin:** Acesso total - CRUD completo de projetos e utilizadores, operações de reset e import/export
- **editor:** Criar e editar projetos, importar projetos
- **guest:** Apenas visualizar projetos (padrão para novos utilizadores)

## Funcionalidades Principais

### Frontend (Exercícios 2 e 3)
- **Integração com API:** Fetch automático de projetos do backend MySQL
- **API URL Dinâmica:** Configuração automática com proxy Vite em dev e detecção em produção
- **Cache-busting:** Sistema para forçar atualização de imagens via timestamp
- **Skills Organizadas:** Competências inteligentemente organizadas por importância (backend)
- **Avatar GitHub:** Integração direta com API do GitHub para avatar via proxy Vite
- **Tema Persistente:** Sistema de temas com localStorage
- **Responsive Design:** Interface adaptável a diferentes dispositivos, otimizada para mobile
- **Error Handling:** Tratamento de erros na comunicação com API

### Backend (Exercício 2 - JSON)
- **Sistema de Cache:** Headers HTTP para controlo de cache (5 minutos) com ETag e Last-Modified
- **Serving de Assets:** Middleware para servir imagens estáticas com cache otimizado
- **LAN Access:** Configuração para acesso via rede local
- **Error Handling:** Tratamento robusto de erros e exceções em todas as rotas
- **API Testing:** Interface HTML completa para testes de endpoints
- **Validação de Dados:** Middleware express-validator para validação de entrada
- **Middleware Chain:** authMiddleware + roleMiddleware + validationMiddleware
- **Import Multiplo:** Suporte para importar múltiplos utilizadores de uma vez

### Backend (Exercício 3 - MySQL)
- **MySQL Integration:** Pool de conexões otimizado com mysql2/promise
- **ID Management:** Sistema para garantir IDs sequenciais e reorganização de IDs
- **Import/Export:** Funcionalidade completa para importar e exportar dados entre JSON e MySQL
- **Password Handling:** Detecção automática de passwords já hasheadas durante importação
- **Security Validations:**
  - Password 12 a 20 caracteres
  - Nome mínimo 5 caracteres
  - Validação e sanitização de email
  - **Proteção XSS avançada:**
    - Sanitização HTML com `sanitize-html` (remove todas as tags HTML)
    - Validação e sanitização de campos de projetos (título, descrição, tecnologias)
    - Validação de URLs (permite apenas http:// e https://, bloqueia javascript:, data:, vbscript:, file:)
    - Proteção contra eventos JavaScript (onclick, onerror, etc.)
    - Encoding HTML (escape de caracteres especiais)
    - Validação de comprimento para todos os campos
  - Argon2 para hashing de senhas (configuração máxima: 128 MB, 5 iterações)
  - Normalização de dados (lowercase, trim)
- **Skills Organization:** Sistema inteligente de organização de competências com scoring baseado em frequência, categoria e posição
- **Error Handling:** Tratamento centralizado com detalhes condicionais (apenas em desenvolvimento)
- **Environment Validation:** Validação de variáveis de ambiente obrigatórias no arranque
- **CORS Configurable:** CORS configurável por ambiente (permissivo em dev, restritivo em produção)
- **Graceful Shutdown:** Encerramento do servidor e pool de conexões
- **Health Check:** Verificação automática da conexão MySQL ao iniciar
- **API Testing:** Interface HTML completa para testes de endpoints
- **Middleware Chain:** authMiddleware + roleMiddleware
- **Sistema de Cache:** Headers HTTP para controlo de cache (5 minutos) com ETag e Last-Modified
- **Serving de Assets:** Middleware para servir imagens estáticas com cache otimizado
- **LAN Access:** Configuração para acesso via rede local

## Licença
GNU v3.0
