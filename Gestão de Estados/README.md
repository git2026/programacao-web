# State Management - Exercícios Práticos em React

Este projeto contém exercícios práticos completos do "State Management in Web Programming"

## Exercícios Implementados

### Exercício 1: Local State Management
- Contador com `useState` hook
- Formulário com estado local
- Estado isolado por componente

### Exercício 2: Global State Management
- Context API para estado global
- Múltiplos componentes compartilhando estado
- Single Source of Truth

### Exercício 3: Asynchronous State Updates
- Fetch de API (JSONPlaceholder)
- Loading states e error handling
- Operações assíncronas com useEffect

### Exercício 4: State Persistence
- Persistência com localStorage
- Rehydrate automático
- Padrões de imutabilidade

## Como Usar

### Pré-requisitos
- **Node.js** (versão 14 ou superior)
- **npm** (vem incluído com o Node.js)

### Instalação e Execução

cd react-app
npm install
npm start

A aplicação deverá abrir automaticamente em http://localhost:3000

## 📁 Estrutura do Projeto

react-app/
├── src/
│   ├── components/
│   │   ├── LocalStateExercise.js      # Exercício 1
│   │   ├── GlobalStateExercise.js     # Exercício 2
│   │   ├── AsyncStateExercise.js      # Exercício 3
│   │   └── PersistenceExercise.js     # Exercício 4
│   ├── context/
│   │   └── AppContext.js              # Contexto global unificado
│   ├── App.js                         # Componente principal
│   └── index.js                       # Ponto de entrada
├── package.json
└── README.md

## Conceitos Demonstrados

- **useState**: Estado local em componentes
- **Context API**: Estado global compartilhado
- **useEffect**: Operações assíncronas e side effects
- **localStorage**: Persistência de estado
- **Imutabilidade**: Padrões com spread operator

## Licença

GNU General Public License v3.0 (GPL-3.0)