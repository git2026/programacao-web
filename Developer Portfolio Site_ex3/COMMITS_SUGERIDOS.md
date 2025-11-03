# Mensagens de Commit Sugeridas - Exercício 3

Lista de commits sugeridos para o Exercício 3, organizados por categoria e ordem cronológica.

---

## 📋 Setup e Configuração Inicial

```
feat(ex3): adicionar script SQL para criação da base de dados MySQL
- Criar ficheiro SQL_BD.sql com schema completo
- Tabelas users e projects com campos necessários
- Suporte para roles (admin, editor, user, guest)
```

```
feat(ex3): configurar pool de conexões MySQL
- Implementar db.js com mysql2/promise
- Configuração de pool otimizado
- Health check automático ao iniciar
```

```
feat(ex3): adicionar ficheiro .env.example com variáveis necessárias
- Variáveis de ambiente para MySQL
- Configuração JWT_SECRET
- Porta configurável
```

---

## 🔐 Segurança e Autenticação

```
feat(ex3): implementar Argon2 para hashing de passwords
- Substituir bcrypt por Argon2 (configuração máxima de segurança)
- 128 MB memory cost, 5 iterações, 4 threads
- Remover dependência bcrypt
```

```
feat(ex3): adicionar validações de segurança avançadas
- Password: 12 a 20 caracteres
- Nome mínimo: 5 caracteres
- Validação e sanitização de email
- Função de escape HTML
```

```
feat(ex3): implementar proteção XSS avançada
- Sanitização HTML com biblioteca sanitize-html
- Validação de URLs (bloqueia javascript:, data:, vbscript:)
- Proteção contra eventos JavaScript
- Validação de caminhos de imagem (/assets/)
```

```
feat(ex3): adicionar validações para campos de projetos
- Validação e sanitização de título (máx. 200 chars)
- Validação e sanitização de descrição (máx. 2000 chars)
- Validação e sanitização de tecnologias
- Validação de caminhos de imagem e URLs GitHub
```

---

## 🗄️ Models e Base de Dados

```
feat(ex3): criar userModel.js para MySQL
- CRUD completo de utilizadores
- Import/Export com detecção de passwords hasheadas
- Sistema de reorganização de IDs sequenciais
- Transações para garantir consistência
```

```
feat(ex3): criar projectModel.js para MySQL
- CRUD completo de projetos
- Import/Export de projetos
- Sistema de reorganização de IDs sequenciais
- Conversão automática de tecnologias (array ↔ string)
```

```
refactor(ex3): garantir IDs sequenciais ao criar registos
- Corrigir AUTO_INCREMENT se necessário
- Garantir que novos registos têm IDs sequenciais (1, 2, 3...)
```

```
fix(ex3): ordenar projetos por ID crescente
- Alterar ORDER BY de created_at DESC para id ASC
- Projetos aparecem na ordem correta no frontend
```

---

## 🎮 Controllers e Lógica de Negócio

```
feat(ex3): atualizar authController.js para MySQL
- Migrar de JSON para MySQL
- Integrar validações de segurança
- Suporte para Argon2
- Detecção de passwords já hasheadas
```

```
feat(ex3): atualizar projectController.js para MySQL
- Migrar de JSON para MySQL
- Adicionar validações completas de inputs
- Endpoint /api/projects/skills com organização inteligente
- Sistema de scoring baseado em frequência e categoria
```

```
feat(ex3): implementar sistema inteligente de organização de skills
- Scoring baseado em frequência de uso
- Pesos por categoria (Core, Frontend, Backend, etc.)
- Divisão em competências principais e secundárias
- Endpoint GET /api/projects/skills
```

---

## 🛣️ Routes e Middleware

```
feat(ex3): atualizar rotas de autenticação para MySQL
- Manter compatibilidade com exercício 2
- Adicionar rotas de import/export
- Rotas de reorganização de IDs
```

```
feat(ex3): atualizar rotas de projetos para MySQL
- Adicionar validações de segurança
- Rotas de import/export
- Rotas de reorganização de IDs
```

```
refactor(ex3): simplificar middleware de autorização
- Remover dependências desnecessárias
- Manter apenas authMiddleware e roleMiddleware
```

---

## 🎨 Frontend

```
feat(ex3): atualizar frontend para consumir API MySQL
- Integração com novos endpoints
- Fetch automático de projetos do backend
- Sistema de cache-busting para imagens
```

```
feat(ex3): implementar detecção automática de URL da API
- Configuração dinâmica baseada em ambiente
- Proxy Vite em desenvolvimento
- Detecção automática em produção
```

```
feat(ex3): adicionar componente Skills com dados do backend
- Fetch de competências organizadas
- Exibição de competências principais e secundárias
- Loading states e tratamento de erros
```

```
fix(ex3): resolver problema de Fast Refresh em Projects.tsx
- Extrair refreshProjects para utilitário separado
- Usar useCallback para estabilizar funções
- Corrigir dependências de useEffect
```

```
feat(ex3): melhorar responsividade mobile
- Ajustar CSS para diferentes tamanhos de ecrã
- Otimizar layout para mobile em Projects, Skills, About
- Melhorar navegação em dispositivos móveis
```

---

## 🧪 Utilitários e Helpers

```
feat(ex3): criar utils/validation.js centralizado
- Validações de segurança (password, nome, email)
- Sanitização HTML avançada
- Validação de URLs e caminhos de imagem
- Constantes de configuração (Argon2, limites)
```

```
feat(ex3): criar utils/errorHandler.js
- Tratamento centralizado de erros
- Detalhes condicionais (apenas em desenvolvimento)
- Formatação padronizada de respostas de erro
```

```
feat(ex3): criar utils/projectRefresh.ts
- Separar lógica de refresh global
- Evitar problemas com Fast Refresh
- Utilidade reutilizável
```

---

## 🧹 Limpeza e Otimização

```
refactor(ex3): remover ficheiros JSON desnecessários
- Remover backend/data/projects.json
- Remover backend/data/users.json
- Migração completa para MySQL
```

```
refactor(ex3): simplificar configuração do servidor
- Remover config/serverConfig.js
- Definir PORT diretamente no server.js
- Otimizar imports do dotenv
```

```
refactor(ex3): remover dependências desnecessárias
- Remover bcrypt (substituído por Argon2)
- Remover node_modules da raiz
- Limpar package.json
```

```
refactor(ex3): atualizar comentários para português
- Garantir todos os comentários em PT-PT
- Comentários curtos e diretos
- Remover comentários redundantes
```

```
chore(ex3): atualizar dependências e remover vulnerabilidades
- Instalar argon2
- Remover bcrypt
- Executar npm audit fix
- 0 vulnerabilidades encontradas
```

---

## 📚 Documentação

```
docs(ex3): atualizar README.md com exercício 3
- Adicionar secção completa sobre MySQL
- Documentar novas funcionalidades de segurança
- Atualizar estrutura do projeto
- Documentar endpoints de import/export
```

```
docs(ex3): criar TUTORIAL_TESTES.md
- Tutorial passo a passo para testar o projeto
- Instruções para capturas de ecrã
- Checklist de funcionalidades
- Resolução de problemas comuns
```

---

## 🐛 Correções e Melhorias

```
fix(ex3): corrigir referência a config.port não definida
- Substituir config.port por constante PORT
- Remover import de serverConfig.js
```

```
fix(ex3): corrigir validação de caminhos de imagem
- Aceitar apenas caminhos relativos /assets/
- Separar validação de URLs externas
- Validar extensões permitidas
```

```
fix(ex3): corrigir ordem de exibição de projetos
- Alterar ORDER BY para id ASC
- Projetos aparecem na ordem sequencial correta
```

---

## 📦 Dependências

```
chore(ex3): adicionar dependências necessárias
- mysql2: ^3.6.5
- argon2: ^0.44.0
- sanitize-html: ^2.17.0
```

```
chore(ex3): remover dependências desnecessárias
- bcrypt: removido (substituído por Argon2)
- express-validator: removido (validação customizada)
- validator: removido (validação customizada)
```

---

## 💡 Como Usar

### Para fazer commits individuais:
```bash
git add <ficheiros>
git commit -m "feat(ex3): implementar Argon2 para hashing de passwords"
```

### Para fazer um commit inicial completo:
```bash
git add .
git commit -m "feat(ex3): migração completa para MySQL

- Implementar base de dados MySQL com mysql2
- Substituir bcrypt por Argon2 (segurança máxima)
- Adicionar validações XSS avançadas
- Implementar sistema de skills inteligente
- Melhorar frontend com detecção automática de API
- Adicionar proteções de segurança completas
- Limpar código e remover dependências desnecessárias"
```

### Para commits incrementais (recomendado):
Fazer commits pequenos e frequentes seguindo a lista acima, agrupando funcionalidades relacionadas.

---

## 📝 Formato de Mensagens

Seguindo o padrão **Conventional Commits**:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Refatoração de código
- `docs`: Documentação
- `chore`: Tarefas de manutenção
- `style`: Formatação, espaços, etc.

Formato: `tipo(escopo): descrição curta`

---

**Nota:** Adapte as mensagens conforme necessário e agrupe commits relacionados para uma história mais limpa no Git.

