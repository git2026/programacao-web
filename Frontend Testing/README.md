# Dashboard PowerBI Transportes

Dashboard interativo estilo PowerBI para análise de dados de transportes públicos em Portugal

## 1. Ferramentas e Tecnologias Utilizadas

### Backend

**Runtime:** Node.js com Express para criação da API REST (ES Modules)

**Base de Dados:** MySQL 8.0+ com mysql2/promise para operações assíncronas, com tabelas relacionais para distritos, concelhos, códigos postais e transportes

**Autenticação:** JSON Web Tokens (JWT) com expiração configurável

**Segurança:**
- WebAssembly (WASM) para hashing de passwords compilado de Rust
- SHA-512 com 10.000 iterações
- Salt único gerado para cada password (16 caracteres aleatórios)
- Validação de password (12 a 20 caracteres)
- Validação de nome mínima (5 caracteres)
- Proteção XSS avançada: Sanitização HTML completa, validação de URLs, proteção contra eventos JavaScript
- Validação de email
- Normalização de dados (lowercase, trim)
- Role-based access control (RBAC) com middleware de permissões (admin, editor, guest)

**WebAssembly Module:**
- Módulo compilado de Rust (password_hash.wasm) em backend/wasm/build/
- SHA-512 com 10.000 iterações e salt único (16 caracteres)
- Formato de hash: $wasm$<salt_base64>$<hash_hex>
- Carregamento direto via API nativa do WebAssembly do Node.js

**Importação de Dados:**
- Importação CSV via interface web (api-tester.html)
- Suporte para múltiplos formatos de encoding (detecção automática com chardet)
- Correção automática de encoding para caracteres portugueses
- Validação e sanitização de dados CSV antes de importar
- Importação em batch para grandes volumes de dados

**Exportação de Dados:**
- Exportação JSON de todas as tabelas
- Exportação de utilizadores com passwords hashed

**API Testing:** Interface HTML interativa (api-tester.html) para testar todos os endpoints

**Process Management:** Script automatizado (start.js) para iniciar frontend e backend simultaneamente com auto-instalação de dependências

**Error Handling:** Tratamento centralizado de erros com detalhes condicionais (apenas em modo desenvolvimento)

**CORS:** Configuração para acesso via rede local e desenvolvimento

**Graceful Shutdown:** Encerramento do servidor e pool de conexões MySQL

### Frontend

**Framework:** React 18 com TypeScript para desenvolvimento do frontend

**Build Tool:** Vite para desenvolvimento rápido e HMR (Hot Module Replacement)

**Routing:** React Router DOM v6 para navegação SPA

**Visualização de Dados:** Recharts para gráficos interativos (BarChart, LineChart, PieChart, AreaChart)

**Estilização:** CSS Modules para componentes isolados

**Funcionalidades:**
- Sistema de temas (claro/escuro) com persistência em localStorage
- Dashboard interativo com 4 KPIs principais e 4 gráficos Recharts
- Filtros dinâmicos (distrito, ano, tipo de transporte) que atualizam todos os gráficos
- KPIs em tempo real
- Gráficos interativos com tooltips
- Layout totalmente responsivo (mobile/tablet/desktop)

**API Integration:** Cliente API com fetch para comunicação com backend

**Error Handling:** Tratamento de erros na comunicação com API e estados de loading

## 2. Requisitos para Execução do Projeto

### Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado e em execução
- Base de dados criada (executar `Dashboard/01_Extras/SQL_BD.sql`)

### Instalação e Execução

Pré-requisitos:

    MySQL instalado e em execução
    Base de dados criada (executar SQL_BD.sql)

Comandos: cd "Dashboard" npm run install-all npm start

**URLs Disponíveis:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Tester: http://localhost:5000/api-tester.html
- LAN Access: http://IP:5173 (frontend) e http://IP:5000 (backend)

## 3. Estrutura do Projeto

```
Dashboard/
├── 01_Extras/
│   ├── SQL_BD.sql                   # Script de criação da base de dados
│   ├── LIMPAR_TABELAS.sql           # Script para limpar todas as tabelas
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Lógica de autenticação e gestão de utilizadores
│   │   ├── dashboardController.js   # Lógica de estatísticas e analytics
│   │   └── importController.js      # Lógica de importação CSV
│   │
│   ├── data/
│   │   ├── distritos.csv             # 30 distritos de Portugal
│   │   ├── concelhos.csv             # 308 concelhos
│   │   ├── codigo_postal.csv         # ~326k códigos postais
│   │   └── transportes.csv           # Dados de transportes (opcional)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js         # Verificação JWT
│   │   └── roleMiddleware.js         # Verificação de roles (admin/editor/guest)
│   │
│   ├── models/
│   │   ├── userModel.js              # Modelo de utilizador (MySQL)
│   │   ├── districtModel.js          # Modelo de distrito (MySQL)
│   │   ├── countyModel.js            # Modelo de concelho (MySQL)
│   │   ├── postalCodeModel.js        # Modelo de código postal (MySQL)
│   │   └── transportModel.js         # Modelo de transporte (MySQL)
│   │
│   ├── routes/
│   │   ├── authRoutes.js             # Rotas de autenticação e gestão de utilizadores
│   │   ├── dashboardRoutes.js        # Rotas de dashboard e estatísticas
│   │   └── importRoutes.js           # Rotas de importação de dados
│   │
│   ├── scripts/
│   │   ├── fix-all-encoding.js       # Script para corrigir encoding em todas as tabelas
│   │   └── gerar_dados_transporte.js # Script para gerar dados fictícios de transportes
│   │
│   ├── utils/
│   │   ├── wasmHash.js              # Carregador WebAssembly para hashing
│   │   ├── validation.js            # Validações de segurança
│   │   ├── errorHandler.js          # Tratamento centralizado de erros
│   │   ├── tokenUtils.js            # Utilidades JWT
│   │   ├── encodingFix.js           # Correção de encoding de strings
│   │   └── errorMessages.js         # Mensagens de erro padronizadas
│   │
│   ├── wasm/
│   │   └── build/
│   │       └── password_hash.wasm    # Módulo WASM compilado
│   │
│   ├── db.js                         # Pool de conexões MySQL
│   ├── api-tester.html               # Interface de testes da API
│   ├── server.js                     # Entry point do servidor Express
│   └── package.json                  # type: "module"
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Charts/
│   │   │   │   │   ├── BarChart.tsx         # Gráfico de barras
│   │   │   │   │   ├── LineChart.tsx        # Gráfico de linha
│   │   │   │   │   ├── PieChart.tsx         # Gráfico de pizza
│   │   │   │   │   ├── AreaChart.tsx        # Gráfico de área
│   │   │   │   │   └── chartUtils.tsx       # Utilitários partilhados para gráficos
│   │   │   │   ├── Filters/
│   │   │   │   │   └── DashboardFilters.tsx # Componente de filtros
│   │   │   │   └── KPICard/
│   │   │   │       └── KPICard.tsx          # Cards de indicadores
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx               # Cabeçalho com navegação
│   │   │   │   └── Header.test.tsx          # Testes unitários do Header (Jest + RTL)
│   │   │   ├── Footer/
│   │   │   │   └── Footer.tsx               # Rodapé
│   │   │   ├── ThemeToggle/
│   │   │   │   ├── ThemeToggle.tsx          # Botão de alternância de tema
│   │   │   │   └── ThemeToggle.test.tsx     # Testes unitários do ThemeToggle (Jest + RTL)
│   │   │   └── ScrollToTop.tsx              # Componente para scroll ao topo
│   │   │
│   │   ├── pages/
│   │   │   └── Dashboard/
│   │   │       └── Dashboard.tsx            # Página principal do dashboard
│   │   │
│   │   ├── services/
│   │   │   └── dashboardApi.ts              # Cliente API para comunicação com backend
│   │   │
│   │   ├── utils/
│   │   │   ├── encodingFix.ts               # Correção de encoding no frontend
│   │   │   └── encodingFix.test.ts          # Testes unitários de encodingFix (Jest)
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css                  # Estilos globais e variáveis CSS
│   │   │
│   │   ├── types/
│   │   │   └── css-modules.d.ts             # Definições de tipos para CSS Modules
│   │   │
│   │   ├── App.tsx                          # Componente principal com routing
│   │   ├── main.tsx                         # Entry point
│   │   ├── setupTests.ts                    # Configuração de testes Jest (jest-dom, matchMedia)
│   │   └── vite-env.d.ts                    # Definições de tipos do Vite
│   │
│   ├── cypress/
│   │   ├── e2e/
│   │   │   └── dashboard-smoke.cy.ts       # Teste E2E smoke do dashboard (Cypress)
│   │   ├── fixtures/
│   │   │   └── dashboard.json              # Dados falsos para intercepts de API
│   │   ├── support/
│   │   │   └── e2e.ts                      # Ficheiro de suporte Cypress (comandos globais)
│   │   └── tsconfig.json                   # Configuração TypeScript para Cypress
│   │
│   ├── test/
│   │   └── __mocks__/
│   │       └── fileMock.js                 # Mock de ficheiros estáticos para Jest
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── jest.config.cjs                     # Configuração Jest (SWC, jsdom, mocks)
│   ├── cypress.config.ts                   # Configuração Cypress E2E
│   └── vite.config.ts                      # Config com proxy API
│
├── package.json                            # Root package.json com scripts
├── start.js                                # Script para iniciar frontend + backend
└── README.md
```

## 4. Endpoints da API

### Autenticação

- `POST /api/auth/registar` - Registar utilizador (público)
- `POST /api/auth/login` - Login (obtém JWT) (público)
- `GET /api/auth/painel` - Dashboard com informações do utilizador (autenticado)
- `GET /api/auth/utilizadores` - Listar todos os utilizadores (admin)
- `GET /api/auth/utilizadores/exportar` - Exportar utilizadores com passwords hasheadas (admin)
- `PUT /api/auth/utilizadores/:id` - Atualizar utilizador específico (admin)
- `DELETE /api/auth/utilizadores/:id` - Eliminar utilizador específico (admin)
- `DELETE /api/auth/utilizadores` - Limpar utilizadores (admin)
- `POST /api/auth/utilizadores/reiniciar-ids` - Reorganizar IDs dos utilizadores (admin)
- `POST /api/auth/utilizadores/importar` - Importar utilizadores de JSON para MySQL (admin)

### Dashboard (Público)

- `GET /api/dashboard/stats/overview` - KPIs gerais (total distritos, concelhos, CPs, cobertura média)
- `GET /api/dashboard/stats/by-district` - Estatísticas por distrito (com limite e ordenação)
- `GET /api/dashboard/stats/district-density` - Densidade de códigos postais por distrito
- `GET /api/dashboard/stats/by-county` - Estatísticas por concelho (com limite e filtro por distrito)
- `GET /api/dashboard/stats/transport-timeline` - Evolução temporal de transportes (2018-2024)
- `GET /api/dashboard/stats/transport-distribution` - Distribuição de rotas por tipo de transporte
- `GET /api/dashboard/stats/transport-coverage` - Cobertura de transportes por distrito/tipo
- `GET /api/dashboard/districts` - Lista de todos os distritos
- `GET /api/dashboard/concelhos` - Lista de todos os concelhos (com filtro opcional por distrito)
- `GET /api/dashboard/transportes` - Lista de transportes (com filtros opcionais)
- `GET /api/dashboard/postal-codes/search?q=` - Pesquisar códigos postais
- `GET /api/dashboard/filters` - Opções disponíveis para filtros (distritos, anos, tipos de transporte)

### Importação (Protegido - Admin/Editor)

- `POST /api/import/distritos` - Importar distritos via CSV (admin/editor)
- `POST /api/import/concelhos` - Importar concelhos via CSV (admin/editor)
- `POST /api/import/codigos-postais` - Importar códigos postais via CSV (admin/editor)
- `POST /api/import/transportes` - Importar transportes via CSV (admin/editor)
- `POST /api/import/tudo` - Importar todos os dados de uma vez (admin/editor)
- `DELETE /api/import/limpar-tabelas` - Limpar todas as tabelas de dados (apenas admin)

### Sistema de Roles

- **admin:** Acesso total - CRUD completo de utilizadores, importação/exportação de dados, limpeza de tabelas
- **editor:** Importar dados (distritos, concelhos, códigos postais, transportes)
- **guest:** Apenas visualizar dashboard e estatísticas (padrão para novos utilizadores)

## 5. Funcionalidades Principais

### Frontend

- **Integração com API:** Fetch automático de dados do backend MySQL
- **API URL Dinâmica:** Configuração automática com proxy Vite em dev e detecção em produção
- **Dashboard Interativo:** 4 KPIs principais e 4 gráficos Recharts interativos (BarChart, LineChart, PieChart, AreaChart)
- **Filtros Dinâmicos:** Filtros por distrito, ano e tipo de transporte que atualizam todos os gráficos em tempo real
- **Tema Persistente:** Sistema de temas (claro/escuro) com localStorage
- **Responsive Design:** Interface adaptável a diferentes dispositivos, otimizada para mobile
- **Error Handling:** Tratamento de erros na comunicação com API e estados de loading

### Backend

- **MySQL Integration:** Pool de conexões otimizado com mysql2/promise, charset utf8mb4, índices otimizados, foreign keys com CASCADE
- **Autenticação e Segurança:** JWT com expiração configurável, WebAssembly (WASM) para hashing de passwords (SHA-512, 10.000 iterações), fallback para crypto nativo, validação de password (12 a 20 caracteres), validação de nome (mínimo 5 caracteres), sanitização HTML completa, validação de URLs, proteção contra eventos JavaScript, normalização de dados (lowercase, trim)
- **Importação de Dados:** Detecção automática de encoding (chardet), correção automática de encoding para caracteres portugueses, validação de formato CSV antes de importar, importação em batch para grandes volumes (~326k códigos postais), progress feedback via API responses
- **Exportação de Dados:** Exportação JSON de todas as tabelas, exportação de utilizadores (com passwords hasheadas), download direto via browser
- **Estatísticas e Analytics:** Queries SQL otimizadas com JOINs e agregações, cálculo de densidades e percentagens, filtros dinâmicos aplicados nas queries
- **Error Handling:** Tratamento centralizado de erros com detalhes condicionais (apenas em desenvolvimento), validação de variáveis de ambiente obrigatórias no arranque, CORS configurável por ambiente (permissivo em dev, restritivo em produção), graceful shutdown do servidor e pool de conexões MySQL, verificação automática da conexão MySQL ao iniciar
- **API Testing:** Interface HTML completa (api-tester.html) para testes de endpoints, gestão de tokens JWT, importação/exportação via interface
- **Process Management:** Script automatizado (start.js) para iniciar frontend e backend simultaneamente, auto-instalação de dependências se necessário

## Testes de Frontend (Jest, React Testing Library, Cypress)

- Unit/Integração: Jest + RTL (jsdom, mocks de CSS/ficheiros, matchMedia).  
- E2E: Cypress com intercepts/fixtures (`cypress/fixtures/dashboard.json`), não depende do backend.  
- Scripts:  
  - `npm test` / `npm run test:coverage`  
  - `npm run cy:open` (UI) / `npm run cy:run` (headless; requer `npm start` a correr em http://localhost:5173)

## 6. Utilização de IA

Este projeto utilizou **Claude AI (Cursor)** para assistência no desenvolvimento.

### Ferramentas Utilizadas
- **Claude (Cursor AI):** Arquitetura, documentação, comentários, otimização e debug

#### Comentários e Documentação
- Geração de comentários JSDoc estruturados explicando funções, parâmetros e retornos
- Comentários arquiteturais explicando estrutura MVC, fluxo de dados e decisões de design
- Documentação completa de endpoints no `api-tester.html` e README

#### Limpeza e Otimização do Código
- Otimização de queries SQL (JOINs, índices, agregações)
- Refatoração de componentes (criação de `chartUtils.tsx` para evitar duplicação)
- Simplificação de código e redução de complexidade ciclomática

#### Resolução de Bugs e Debug
- Detecção de erros de TypeScript, sintaxe e lógica
- Correção de problemas de encoding em caracteres portugueses
- Correção de endpoints mal escritos
- Debug de autenticação JWT e middleware
- Correção de erros de TypeScript relacionados com tipos implícitos
- Melhoria de validação de inputs e tratamento de erros
- Correção de bugs em filtros, agregações e renderização de gráficos

### Declaração de Honestidade Académica
✅ Compreendo completamente todo o código  
✅ Testei todas as funcionalidades manualmente  
✅ Posso explicar cada linha de código  
✅ Fiz ajustes significativos ao código sugerido  
✅ A IA foi assistente, não autora principal

## 7. Reflexão Final: Limitações e Melhorias

### Limitações Identificadas

**Performance:**
- Importação de códigos postais pode demorar 1-2 minutos para ~326k registos
- Algumas queries complexas podem ser lentas com muitos dados

**Funcionalidades:**
- Filtros limitados (apenas distrito, ano e tipo de transporte)
- Apenas exportação JSON disponível
- Apenas 4 tipos de gráficos

**Segurança:**
- Algumas validações poderiam ser mais robustas
- Rate limiting não implementado
- Alguns inputs poderiam ser melhor sanitizados

**Experiência do Utilizador:**
- Algumas operações não têm feedback visual claro
- Alguns componentes não mostram estado de carregamento
- Mensagens de erro poderiam ser mais descritivas

### Melhorias Futuras Sugeridas

**Curto Prazo:**
- Progress bar para importações
- Validação de CSV antes de importar
- Exportação CSV/Excel
- Filtros avançados (múltiplos distritos, intervalos de datas)
- Cache de queries (Redis)

**Médio Prazo:**
- Gráficos de mapa geográfico
- Dashboard personalizável
- Histórico de alterações
- API versioning
- Documentação interativa (Swagger/OpenAPI)

**Longo Prazo:**
- Real-time updates (WebSockets)
- Machine Learning para previsões
- Multi-tenant
- Mobile app (React Native)
- Integração com APIs externas de transportes em tempo real

### Lições Aprendidas

**O que correu bem:**
- Arquitetura MVC facilitou desenvolvimento e manutenção
- TypeScript preveniu muitos erros
- Recharts é robusto e fácil de usar
- IA como assistente aumentou produtividade

**O que poderia ser melhorado:**
- Documentar incrementalmente

### Licença
GNU v3.0