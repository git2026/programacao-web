# Developer Portfolio - Projeto Full-Stack

Portfólio de desenvolvedor moderno com frontend em React e backend em Node.js, incluindo autenticação JWT e autorização baseada em roles.

## 1. Ferramentas e Tecnologias Utilizadas

### Frontend (Exercício 1)
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite para desenvolvimento rápido
- **Routing**: React Router DOM v6 para navegação
- **Estilização**: CSS Modules para componentes isolados
- **Tema**: Toggle dark/light mode com persistência

### Backend (Exercício 2)
- **Runtime**: Node.js com Express
- **Autenticação**: JWT (JSON Web Tokens) com expiração de 24h
- **Segurança**: bcryptjs para hashing de passwords
- **Validação**: express-validator para validação de dados
- **CORS**: Configurado para comunicação frontend-backend
- **Autorização**: Sistema de roles (admin, editor, guest)
- **Persistência**: JSON files (users.json, projects.json)

## 2. Requisitos para Execução do Projeto

### Instalação

**Frontend:**
```bash
npm install
npm start
```
Aceda ao frontend em: http://localhost:5173

**Backend:**
```bash
cd backend
npm install
npm start
```
API disponível em: http://localhost:5000

### Testes do Backend

O backend foi testado com sucesso. Resultados dos testes:

✅ **Servidor**: Running on http://localhost:5000  
✅ **Registo de Utilizadores**: Admin e Guest criados com sucesso  
✅ **Login**: Autenticação com JWT funcional  
✅ **Autorização**: Proteção de rotas por token  
✅ **Roles**: Admin pode criar projetos, Guest bloqueado  
✅ **Projetos API**: GET (todos), GET (individual), POST (criar)  
✅ **Error Handling**: Retorna erros apropriados (401, 404)

**Credenciais de Teste:**
- Admin: `admin@example.com` / `admin123`
- Guest: `guest@example.com` / `guest123`

## Estrutura do Projeto

```
Developer Portfolio Site_ex2/
├── backend/                      # API Express (Exercício 2)
│   ├── config/
│   │   └── serverConfig.js       # Configuração do servidor
│   ├── controllers/
│   │   ├── authController.js     # Lógica de autenticação
│   │   └── projectController.js  # Lógica de projetos
│   ├── data/
│   │   ├── projects.json         # Base de dados de projetos
│   │   └── users.json            # Base de dados de utilizadores
│   ├── middleware/
│   │   ├── authMiddleware.js     # Verificação JWT
│   │   ├── roleMiddleware.js     # Verificação de roles
│   │   └── validationMiddleware.js # Validação express-validator
│   ├── models/
│   │   ├── userModel.js          # Modelo de utilizador
│   │   └── projectModel.js       # Modelo de projeto
│   ├── routes/
│   │   ├── authRoutes.js         # Rotas de autenticação
│   │   └── projectRoutes.js      # Rotas de projetos
│   ├── utils/
│   │   └── tokenUtils.js         # Utilidades JWT
│   ├── server.js                 # Entry point da API
│   ├── package.json
│   └── README.md                 # Documentação do backend
├── src/                          # Frontend React (Exercício 1)
│   ├── components/
│   │   ├── Header/               # Cabeçalho com navegação
│   │   ├── Footer/               # Rodapé
│   │   ├── ThemeToggle/          # Toggle dark/light mode
│   │   └── ScrollToTop.tsx       # Scroll to top automático
│   ├── sections/
│   │   ├── About/                # Secção sobre mim
│   │   ├── Projects/             # Secção de projetos
│   │   └── Skills/               # Secção de skills
│   ├── data/
│   │   ├── config.ts             # Configuração global
│   │   ├── profile.ts            # Dados do perfil
│   │   └── projects.ts           # Dados dos projetos
│   ├── styles/
│   │   └── globals.css           # Estilos globais
│   ├── types/
│   │   └── css-modules.d.ts      # Type definitions
│   ├── App.tsx                   # Componente principal
│   └── main.tsx                  # Entry point
├── public/
│   └── assets/                   # Imagens e recursos
├── index.html                    # HTML principal
├── package.json
├── tsconfig.json
├── vite.config.ts
├── EXERCICIO_1_README.md         # Documentação Exercício 1
└── README.md                     # Este ficheiro
```

## 3. Endpoints da API

| Método | Endpoint | Acesso | Descrição |
|--------|----------|--------|-----------|
| GET | `/` | Público | Info da API |
| POST | `/api/auth/register` | Público | Registar utilizador |
| POST | `/api/auth/login` | Público | Login (obtém JWT) |
| GET | `/api/auth/dashboard` | Protegido | Dashboard do utilizador |
| GET | `/api/projects` | Público | Listar todos os projetos |
| GET | `/api/projects/:id` | Público | Obter projeto específico |
| POST | `/api/projects` | Admin | Criar novo projeto |

## 4. Funcionalidades Principais

### Frontend
- ✅ Layout responsivo (mobile, tablet, desktop)
- ✅ Tema dark/light com persistência em localStorage
- ✅ Navegação com React Router
- ✅ Três secções principais: About, Projects, Skills
- ✅ Componentes TypeScript tipados
- ✅ CSS Modules para isolamento de estilos

### Backend
- ✅ Sistema de autenticação JWT
- ✅ Registro e login de utilizadores
- ✅ Hash de passwords com bcrypt (10 rounds)
- ✅ Autorização baseada em roles (admin, editor, guest)
- ✅ API RESTful para gestão de projetos
- ✅ Middleware de proteção de rotas
- ✅ Tratamento de erros apropriado
- ✅ CORS configurado para desenvolvimento

## 5. Personalização

**Frontend:** Edite `src/data/profile.ts` e `src/data/projects.ts`  
**Backend:** Configure `JWT_SECRET` no ficheiro `.env`
**Imagens:** Substitua as imagens em `public/assets/`

## 6. Notas de Segurança
- Passwords protegidas com bcrypt
- Tokens JWT expiram após 24 horas
- CORS configurado para desenvolvimento