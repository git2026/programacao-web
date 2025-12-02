/**
 * Context API - Estado Global da Aplicação
 * 
 * Gerencia todo o estado global compartilhado entre componentes:
 * - Tema (claro/escuro)
 * - Autenticação de utilizador
 * - Contador global
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// Contexto principal da aplicação
const AppContext = createContext();

// Provider que envolve a aplicação
export const AppProvider = ({ children }) => {
  // Estado do tema
  const [theme, setTheme] = useState('light');
  
  // Estado de autenticação
  const [user, setUser] = useState(null);
  
  // Contador global
  const [globalCounter, setGlobalCounter] = useState(0);

  // Aplica o tema ao body quando muda
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Funções do tema
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  // Funções de autenticação
  const login = (username) => setUser(username);
  const logout = () => setUser(null);

  // Funções do contador global
  const incrementGlobalCounter = () => setGlobalCounter(prev => prev + 1);
  const decrementGlobalCounter = () => setGlobalCounter(prev => prev - 1);
  const resetGlobalCounter = () => setGlobalCounter(0);

  // Valor do contexto
  const value = {

    // Tema
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,

    // Autenticação
    user,
    login,
    logout,

    // Contador
    globalCounter,
    incrementGlobalCounter,
    decrementGlobalCounter,
    resetGlobalCounter
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};