# RESTful API Advanced Topics

Aplicação RESTful demonstrando conceitos avançados de APIs: Rate Limiting, Paginação baseada em cursor e Cache HTTP com ETag.

## 1. Ferramentas e Tecnologias Utilizadas

**Conceitos Demonstrados:**
- **Runtime:** Node.js com CommonJS
- **Framework:** Express.js 4.18+
- **Rate Limiting:** express-rate-limit com políticas personalizadas
- **Paginação:** Cursor-based pagination para grandes datasets
- **Cache:** HTTP caching com suporte a ETag e If-None-Match
- **Autenticação:** Token-based authentication (simulado)

**Funcionalidades:**
- Rate limiting com diferentes políticas por endpoint
- Paginação baseada em cursor com limite máximo
- Cache HTTP com ETag para otimização
- Interface HTML completa para testes
- Headers de rate limit e cache comunicados ao cliente
- Encerramento gracioso de requisições

## 2. Requisitos para Execução

**Pré-requisitos:**
- Node.js 14.0.0 ou superior
- npm ou yarn

**Comandos:**
```bash
npm install
npm start
npm run dev  # modo desenvolvimento
```

**URLs Disponíveis:**
- Servidor: http://localhost:3000
- Interface de Testes: http://localhost:3000
- Health Check: http://localhost:3000/health
- Login: http://localhost:3000/api/auth/login
- Produtos: http://localhost:3000/api/products
- Endpoint Protegido: http://localhost:3000/api/protected

## 3. Estrutura do Projeto

```
restful/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
│
├── src/
│   ├── server.js               # Servidor Express principal
│   │
│   ├── middleware/
│   │   ├── rateLimiting.js     # Rate limiting
│   │   ├── auth.js             # Middleware de autenticação
│   │   ├── pagination.js       # Validação de paginação
│   │   └── caching.js          # Cache com ETag
│   │
│   └── controllers/
│       ├── index.js            # Controllers principais
│       ├── products.js         # Lógica de produtos
│       └── auth.js             # Lógica de autenticação
│
└── public/
    └── index.html              # Interface de testes
```

## 4. Endpoints da API

**Health Check:**
- `GET /health` - Estado do servidor

**Autenticação:**
- `POST /api/auth/login` - Login com rate limiting estrito (10 pedidos por 10 minutos)
  - Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "message": "Login realizado com sucesso", "token": "Bearer ...", "user": {...} }`

**Produtos:**
- `GET /api/products?limit=10&cursor=prod_10` - Lista de produtos com paginação, cache e rate limiting
  - Query params:
    - `limit` (opcional): Número de itens por página (máx: 50, padrão: 10)
    - `cursor` (opcional): Cursor para próxima página
  - Headers de cache: ETag, Cache-Control, Last-Modified
  - Suporta If-None-Match para 304 Not Modified

**Endpoint Protegido:**
- `GET /api/protected` - Endpoint que requer autenticação
  - Header: `Authorization: Bearer <token>`
  - Rate limit: 500 pedidos por 15 minutos (autenticados)

## 5. Funcionalidades Principais

**Rate Limiting:**
- Endpoints públicos: 100 pedidos por 15 minutos
- Utilizadores autenticados: 500 pedidos por 15 minutos
- Endpoint de login: 10 pedidos por 10 minutos (reduz risco de força bruta)
- Rate limiter dinâmico baseado em role (admin vs user)
- Headers `RateLimit-*` comunicados ao cliente
- HTTP 429 em violações com `retryAfter`

**Paginação:**
- Paginação baseada em cursor (eficiente para grandes datasets)
- Limite máximo de 50 itens por página
- Validação rigorosa de parâmetros
- Metadados completos na resposta (limit, cursor, nextCursor, hasMore, total)

**Cache HTTP:**
- Cache com ETag baseado em hash MD5 do conteúdo
- Suporte a header `If-None-Match` para 304 Not Modified
- Headers `Cache-Control: public, max-age=60`
- Cache por URL e query parameters
- Limpeza automática de entradas antigas (TTL: 5 minutos)

**Integração:**
- Ordem correta de middlewares: Rate Limiting → Autenticação → Validação → Cache → Controller
- Cada mecanismo reforça os outros sem conflitos
- Endpoint escalável e pronto para produção

**Interface de Testes:**
- Interface HTML completa para testar todos os exercícios
- Visualização de headers de rate limit e cache
- Testes de paginação com navegação
- Teste automatizado de rate limiting
- Feedback visual (sucesso/erro/info)

## 6. Testes

A interface HTML em `http://localhost:3000` permite:
- Enviar múltiplos pedidos para verificar rate limiting
- Ver estatísticas de sucessos vs bloqueados

## 7. Conceitos Demonstrados

**Rate Limiting:**
- Proteção contra abuso e sobrecarga
- Diferentes políticas para diferentes endpoints
- Comunicação clara de limites através de headers
- Redução de risco de ataques de força bruta

**Paginação:**
- Controle de volume de dados retornados
- Cursor-based pagination (eficiente e escalável)
- Validação de parâmetros para evitar cache explosion
- Metadados claros para navegação

**Cache HTTP:**
- Redução de carga no servidor
- ETag para validação de conteúdo
- Suporte a 304 Not Modified
- Headers apropriados para controlo de cache

**Integração:**
- Ordem crítica de middlewares
- Mecanismos que se reforçam mutuamente
- Design escalável para produção
- Evitar armadilhas comuns de integração

## Licença
GPL-3.0