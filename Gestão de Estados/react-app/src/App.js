/**
 * Componente principal da aplicação
 * Gerencia navegação entre exercícios de State Management
 */

import React, { useState } from 'react';
import './App.css';
import { AppProvider } from './context/AppContext';
import LocalStateExercise from './components/LocalStateExercise';
import GlobalStateExercise from './components/GlobalStateExercise';
import AsyncStateExercise from './components/AsyncStateExercise';
import PersistenceExercise from './components/PersistenceExercise';

function App() {
  // Estado local para controlar a aba ativa
  const [activeTab, setActiveTab] = useState('local');

  // Configuração das abas disponíveis
  const tabs = [
    { id: 'local', label: 'Local State', component: LocalStateExercise },
    { id: 'global', label: 'Global State', component: GlobalStateExercise },
    { id: 'async', label: 'Async State', component: AsyncStateExercise },
    { id: 'persistence', label: 'Persistence', component: PersistenceExercise }
  ];

  // Componente ativo baseado na aba selecionada
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || LocalStateExercise;

  return (
    <AppProvider>
      <div className="App">
        <header className="app-header">
          <h1>State Management em Aplicações Web</h1>
          <p className="subtitle">Exercícios Práticos em React</p>
        </header>

        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="tab-content">
          <ActiveComponent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;