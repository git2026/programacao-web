# Exercício 2 - Backend API do Portfólio

API RESTful desenvolvida com Node.js e Express para gestão de utilizadores e projetos, incluindo autenticação JWT e autorização baseada em roles.

## 1. Ferramentas e Tecnologias Utilizadas

- **Runtime**: Node.js v25+ com módulos ES6
- **Framework**: Express para criação da API REST
- **Autenticação**: JSON Web Tokens (JWT) com expiração de 24h
- **Segurança**: bcryptjs para hashing de passwords (10 rounds)
- **Validação**: express-validator para validação de dados
- **CORS**: Habilitado para comunicação cross-origin
- **Configuração**: dotenv para variáveis de ambiente
- **Autorização**: Sistema de roles (admin, editor, guest)
- **Persistência**: Ficheiros JSON para armazenamento de dados (users.json, projects.json)

## 2. Requisitos para Execução

### Instalação das Dependências
```bash
cd backend
npm install
```

### Execução do Servidor

**Modo Normal:**
```bash
npm start
```

O servidor estará disponível em: http://localhost:5000

### Configuração (Opcional)

Crie um ficheiro `.env` na pasta `backend/`:
```env
PORT=5000
JWT_SECRET=chave_secreta
NODE_ENV=development
```

Se não configurar, serão usados os valores padrão definidos em `config/serverConfig.js`.

### 🎨 Interface HTML de Testes

**A forma mais fácil de testar a API!**

Abra o ficheiro `api-tester.html` no seu browser:

```bash
# No Windows
start backend/api-tester.html

# No Mac
open backend/api-tester.html

# No Linux
xdg-open backend/api-tester.html
```

A interface inclui:
- ✅ Todas as operações da API organizadas por abas
- ✅ Gestão automática de tokens JWT
- ✅ Visualização de respostas formatadas
- ✅ Design moderno e responsivo
- ✅ Sem instalação de software adicional

### 🔢 Sistema de IDs Inteligente

O backend utiliza um sistema de IDs incrementais com **reutilização automática**:

**Como funciona:**
- Utilizadores começam com ID 1, 2, 3...
- Projetos começam com ID 1, 2, 3...
- Quando um utilizador/projeto é eliminado, o ID fica "livre"
- Ao criar um novo registo, o sistema reutiliza IDs livres primeiro
- Se não houver IDs livres, incrementa para o próximo

**Exemplo:**
```
Criar User 1 → ID: 1
Criar User 2 → ID: 2
Criar User 3 → ID: 3
Eliminar User 2 → ID 2 libertado
Criar User 4 → ID: 2 (reutilizado!)
Criar User 5 → ID: 4
```

Isto garante IDs pequenos e organizados, mesmo com muitas operações de criar/eliminar!

## 3. Tutorial de Testes com Postman

Este guia mostra como testar todos os endpoints da API usando o Postman.

### Passo 1: Verificar se o Servidor está a Correr

**Request:**
```
GET http://localhost:5000
```

**Resposta Esperada:**
```json
{
  "message": "Portfolio API Server",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "projects": "/api/projects"
  }
}
```

---

### Passo 2: Registar um Utilizador ADMIN

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin"
}
```

**Resposta Esperada:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Importante:** Copie o `token` da resposta - vai precisar dele nos próximos passos!

---

### Passo 3: Registar um Utilizador GUEST

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "guest@example.com",
  "password": "guest123",
  "name": "Guest User",
    "role": "guest"
  }
```

**Resposta Esperada:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Importante:** Guarde também este token para testes de autorização!

---

### Passo 4: Login como ADMIN

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Resposta Esperada:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Passo 5: Aceder ao Dashboard (Rota Protegida)

**Request:**
```
GET http://localhost:5000/api/auth/dashboard
```

**Headers:**
```
Authorization: Bearer <SEU_TOKEN_AQUI>
```

**Como configurar no Postman:**
1. Vá ao separador **Headers**
2. Adicione: `Authorization` = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...`
3. OU use o separador **Authorization** → Type: **Bearer Token** → Cole o token

**Resposta Esperada:**
```json
{
  "message": "Welcome to your dashboard, admin@example.com!",
  "user": {
    "id": "1761214695440",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

---

### Passo 6: Listar Todos os Projetos (Público)

**Request:**
```
GET http://localhost:5000/api/projects
```

**Não precisa de autenticação!**

**Resposta Esperada:**
```json
[
  {
    "id": "1761214758505",
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce application...",
    "technologies": ["React", "Node.js", "Express", "MongoDB"],
    "image": "https://via.placeholder.com/400x300",
    "link": "https://example.com",
    "github": "https://github.com/username/ecommerce",
    "createdBy": "admin@example.com",
    "createdAt": "2025-10-23T10:19:18.505Z"
  }
]
```

---

### Passo 7: Criar um Novo Projeto (ADMIN apenas)

**Request:**
```
POST http://localhost:5000/api/projects
Content-Type: application/json
```

**Headers:**
```
Authorization: Bearer <TOKEN_DO_ADMIN>
```

**Body (JSON):**
```json
{
  "title": "E-Commerce Platform",
  "description": "Full-stack e-commerce application with shopping cart and payment integration",
  "technologies": ["React", "Node.js", "Express", "MongoDB", "Stripe"],
  "image": "https://via.placeholder.com/400x300",
  "github": "https://github.com/username/ecommerce"
}
```

**Resposta Esperada:**
```json
{
  "message": "Project created successfully",
  "project": {
    "id": "1761214758505",
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce application...",
    "technologies": ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    "image": "https://via.placeholder.com/400x300",
    "link": "https://example.com",
    "github": "https://github.com/username/ecommerce",
    "createdBy": "admin@example.com",
    "createdAt": "2025-10-23T10:19:18.505Z"
  }
}
```

---

### Passo 8: Obter um Projeto Específico

**Request:**
```
GET http://localhost:5000/api/projects/1761214758505
```

**Não precisa de autenticação!**

**Resposta Esperada:**
```json
{
  "id": "1761214758505",
  "title": "E-Commerce Platform",
  "description": "Full-stack e-commerce application...",
  "technologies": ["React", "Node.js", "Express", "MongoDB"],
  "image": "https://via.placeholder.com/400x300",
  "link": "https://example.com",
  "github": "https://github.com/username/ecommerce",
  "createdBy": "admin@example.com",
  "createdAt": "2025-10-23T10:19:18.505Z"
}
```

---

### Passo 9: Testar Autorização - GUEST Tentando Criar Projeto (deve falhar)

**Request:**
```
POST http://localhost:5000/api/projects
Content-Type: application/json
```

**Headers:**
```
Authorization: Bearer <TOKEN_DO_GUEST>
```

**Body (JSON):**
```json
{
  "title": "Should Fail",
  "description": "This should not work for guest users"
}
```

**Resposta Esperada (ERRO):**
```json
{
  "error": "Access denied. admin role required"
}
```
**Status Code:** 403 Forbidden

---

### Passo 10: Testar Sem Token (deve falhar)

**Request:**
```
GET http://localhost:5000/api/auth/dashboard
```

**SEM adicionar o header Authorization!**

**Resposta Esperada (ERRO):**
```json
{
  "error": "No token provided"
}
```
**Status Code:** 401 Unauthorized

---

### 📋 Resumo dos Testes

| # | Teste | Resultado Esperado |
|---|-------|-------------------|
| 1 | GET / | ✅ Info da API |
| 2 | Registar Admin | ✅ Token recebido |
| 3 | Registar Guest | ✅ Token recebido |
| 4 | Login Admin | ✅ Token recebido |
| 5 | Dashboard com token | ✅ Dados do utilizador |
| 6 | Listar projetos | ✅ Array de projetos |
| 7 | Criar projeto (Admin) | ✅ Projeto criado |
| 8 | Obter projeto por ID | ✅ Dados do projeto |
| 9 | Criar projeto (Guest) | ❌ 403 Forbidden |
| 10 | Dashboard sem token | ❌ 401 Unauthorized |

---

### 💡 Dicas Postman

**Salvar Tokens como Variáveis:**
1. Depois de fazer login, vá ao separador **Tests**
2. Adicione este script:
```javascript
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```
3. Agora pode usar `{{token}}` nos headers de Authorization!

**Criar uma Collection:**
1. Crie uma nova Collection no Postman
2. Adicione todos os 10 requests acima
3. Configure variáveis de ambiente para `baseUrl = http://localhost:5000`
4. Use `{{baseUrl}}/api/auth/login` nos requests

**Organização Sugerida:**
```
📁 Portfolio API
  📁 Auth
    - Register Admin
    - Register Guest
    - Login Admin
    - Login Guest
    - Dashboard (Protected)
  📁 Projects
    - Get All Projects
    - Get Project by ID
    - Create Project (Admin)
    - Create Project (Guest - FAIL)
```

---

## 4. Estrutura do Backend

```
backend/
├── config/
│   └── serverConfig.js       # Configuração do servidor e JWT
├── controllers/
│   ├── authController.js     # Lógica de registro e login
│   └── projectController.js  # Lógica de gestão de projetos
├── data/
│   └── projects.json         # Armazenamento de projetos
├── middleware/
│   ├── authMiddleware.js     # Verificação de token JWT
│   └── roleMiddleware.js     # Verificação de roles
├── models/
│   ├── userModel.js          # Modelo e operações de utilizador
│   └── projectModel.js       # Modelo e operações de projeto
├── routes/
│   ├── authRoutes.js         # Rotas de autenticação
│   └── projectRoutes.js      # Rotas de projetos
├── utils/
│   └── tokenUtils.js         # Geração e verificação de tokens
├── server.js                 # Entry point da aplicação
├── package.json
└── README.md                 # Este ficheiro
```

## 5. Endpoints da API

### Autenticação

#### Registar Utilizador
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nome do Utilizador",
  "role": "admin"  // ou "editor", "guest"
}

Resposta: { "message": "User registered successfully", "token": "..." }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Resposta: { "message": "Login successful", "token": "..." }
```

#### Dashboard (Protegido)
```http
GET /api/auth/dashboard
Authorization: Bearer <seu_token_jwt>

Resposta: { "message": "Welcome...", "user": {...} }
```

#### Listar Utilizadores (Admin)
```http
GET /api/auth/users
Authorization: Bearer <token_admin>

Resposta: [ { "id": 1, "email": "...", "name": "...", "role": "..." }, ... ]
```

#### Atualizar Utilizador (Admin)
```http
PUT /api/auth/users/:id
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "name": "Novo Nome",      // opcional
  "email": "novo@email.com", // opcional
  "role": "editor"           // opcional
}

Resposta: { "message": "User updated successfully", "user": {...} }
```

#### Eliminar Utilizador (Admin)
```http
DELETE /api/auth/users/:id
Authorization: Bearer <token_admin>

Resposta: { "message": "User deleted successfully", "user": {...} }
```

### Projetos

#### Listar Todos os Projetos (Público)
```http
GET /api/projects

Resposta: [ { "id": "1", "title": "...", ... }, ... ]
```

#### Obter Projeto Específico (Público)
```http
GET /api/projects/:id

Resposta: { "id": "1", "title": "...", ... }
```

#### Criar Projeto (Admin/Editor Apenas)
```http
POST /api/projects
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "title": "Nome do Projeto",
  "description": "Descrição detalhada",
  "technologies": ["React", "Node.js", "MongoDB"],
  "image": "https://url-da-imagem.com/image.png",
  "github": "https://github.com/user/repo"
}

Resposta: { "message": "Project created successfully", "project": {...} }
```

#### Atualizar Projeto (Admin)
```http
PUT /api/projects/:id
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "title": "Título Atualizado",               // opcional
  "description": "Nova descrição...",          // opcional
  "technologies": ["Vue", "TypeScript"],       // opcional
  "image": "https://nova-imagem.com/img.png",  // opcional
  "github": "https://github.com/user/repo2"    // opcional
}

Resposta: { "message": "Project updated successfully", "project": {...} }
```

#### Eliminar Projeto (Admin)
```http
DELETE /api/projects/:id
Authorization: Bearer <token_admin>

Resposta: { "message": "Project deleted successfully", "project": {...} }
```

## 6. Resultados dos Testes Realizados

### ✅ Todos os Testes Passaram com Sucesso

1. **Servidor**
   - ✅ API rodando em http://localhost:5000
   - ✅ Retorna informações da API na rota raiz

2. **Registro de Utilizadores**
   - ✅ Admin criado: `admin@example.com`
   - ✅ Guest criado: `guest@example.com`
   - ✅ Tokens JWT gerados corretamente

3. **Login**
   - ✅ Autenticação bem-sucedida
   - ✅ Token retornado e validado

4. **Rotas Protegidas**
   - ✅ Dashboard acessível com token válido
   - ✅ Retorna dados do utilizador autenticado
   - ✅ Bloqueia acesso sem token: `"No token provided"`

5. **Autorização por Roles**
   - ✅ Admin pode criar projetos
   - ✅ Guest bloqueado: `"Access denied. admin role required"`
   - ✅ Editor pode criar projetos

6. **API de Projetos**
   - ✅ GET /api/projects - Lista todos
   - ✅ GET /api/projects/:id - Obtém projeto específico
   - ✅ POST /api/projects - Cria novo (admin/editor)
   - ✅ Metadata incluída: `createdBy`, `createdAt`

7. **Error Handling**
   - ✅ 401 Unauthorized para acessos sem token
   - ✅ 403 Forbidden para roles insuficientes
   - ✅ 404 Not Found para projetos inexistentes
   - ✅ Validação de dados de entrada

### Credenciais de Teste Criadas

- **Admin**: `admin@example.com` / `admin123`
- **Guest**: `guest@example.com` / `guest123`

## 7. Sistema de Roles

| Role | Permissões |
|------|------------|
| **admin** | ✅ Criar projetos<br>✅ Ver todos os projetos<br>✅ Acesso ao dashboard |
| **editor** | ✅ Criar projetos<br>✅ Ver todos os projetos<br>✅ Acesso ao dashboard |
| **guest** | ❌ Não pode criar projetos<br>✅ Ver todos os projetos<br>✅ Acesso ao dashboard |

## 8. Códigos de Status HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Operação bem-sucedida |
| 201 | Created | Recurso criado (registro, projeto) |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Sem autenticação |
| 403 | Forbidden | Sem permissão (role) |
| 404 | Not Found | Recurso não encontrado |
| 500 | Server Error | Erro interno do servidor |

## 9. Respostas de Erro

A API retorna erros no formato JSON:

```json
// Sem token
{ "error": "No token provided" }

// Token inválido
{ "error": "Invalid token" }

// Role insuficiente
{ "error": "Access denied. admin role required" }

// Projeto não encontrado
{ "error": "Project not found" }

// Credenciais inválidas
{ "error": "Invalid credentials" }

// Utilizador já existe
{ "error": "User already exists" }
```

## 10. Segurança

### Proteções Implementadas
- ✅ Passwords nunca armazenadas em texto plano
- ✅ Hashing com bcrypt (10 salt rounds)
- ✅ Tokens JWT assinados com secret key
- ✅ Expiração de tokens (24 horas)
- ✅ Validação de roles em rotas protegidas
- ✅ Middleware de autenticação centralizado
- ✅ CORS configurado

### Limitações (Desenvolvimento)
- ⚠️ Utilizadores armazenados em memória (usar BD em produção)
- ⚠️ Projetos em ficheiro JSON (usar BD em produção)
- ⚠️ JWT_SECRET padrão (definir secret forte em produção)
- ⚠️ Sem rate limiting (adicionar em produção)
- ⚠️ Sem HTTPS (necessário em produção)

## 11. Dependências

```json
{
  "express": "^4.18.2",      // Framework web
  "bcryptjs": "^2.4.3",      // Hashing de passwords
  "jsonwebtoken": "^9.0.2",  // JWT tokens
  "dotenv": "^16.3.1",       // Variáveis de ambiente
  "cors": "^2.8.5"           // Cross-Origin Resource Sharing
}
```

## 12. Deploy em Produção

### Checklist de Segurança
- [ ] Definir `JWT_SECRET` forte e aleatório
- [ ] Configurar `NODE_ENV=production`
- [ ] Implementar base de dados (MongoDB, PostgreSQL)
- [ ] Adicionar rate limiting
- [ ] Configurar HTTPS
- [ ] Adicionar logging apropriado
- [ ] Implementar validação de dados robusta
- [ ] Configurar CORS para domínios específicos

### Plataformas Recomendadas
- Heroku
- Railway
- Render
- Vercel (serverless)
- AWS / Azure / GCP

## Licença

MIT
