/**
 * Exercício 2: Estado Global
 * Demonstra gerenciamento de estado global com Context API
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

// Componente A: Login/Logout
function LoginComponent() {
  const { user, login, logout } = useApp();
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      login(username);
      setUsername('');
    } else {
      alert('Por favor, insira um nome de usuário');
    }
  };

  return (
    <div className="widget">
      <h3>Componente A - Login</h3>
      {!user ? (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nome de usuário"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '5px'
            }}
          />
          <button className="btn btn-primary" onClick={handleLogin}>
            Login
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '10px' }}>Usuário: <strong>{user}</strong></p>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      )}
      <p className="component-status">
        Status: <span>{user ? `Usuário: ${user}` : 'Aguardando login...'}</span>
      </p>
    </div>
  );
}

// Componente B: Seletor de tema
function ThemeComponent() {
  const { theme, setLightTheme, setDarkTheme } = useApp();

  return (
    <div className="widget">
      <h3>Componente B - Tema</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="btn btn-light" onClick={setLightTheme}>
          Tema Claro
        </button>
        <button className="btn btn-dark" onClick={setDarkTheme}>
          Tema Escuro
        </button>
      </div>
      <p className="component-status">
        Status: <span>Tema atual: {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
      </p>
    </div>
  );
}

// Componente C: Contador global
function GlobalCounterComponent() {
  const { globalCounter, incrementGlobalCounter, decrementGlobalCounter, resetGlobalCounter } = useApp();

  return (
    <div className="widget">
      <h3>Componente C - Contador Global</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        <button className="btn btn-danger" onClick={decrementGlobalCounter}>-</button>
        <button className="btn btn-secondary" onClick={resetGlobalCounter}>Reset</button>
        <button className="btn btn-success" onClick={incrementGlobalCounter}>+</button>
      </div>
      <p className="component-status">
        Status: <span>Contador: {globalCounter}</span>
      </p>
    </div>
  );
}

// Display do estado global
function GlobalStateDisplay() {
  const { user, globalCounter, theme } = useApp();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '25px',
      borderRadius: '10px',
      marginBottom: '30px'
    }}>
      <h3 style={{ color: 'white', marginBottom: '20px' }}>Estado Global da Aplicação</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px'
        }}>
          <span style={{ fontWeight: 600, fontSize: '1.1em' }}>Usuário:</span>
          <span style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '5px 15px',
            borderRadius: '20px'
          }}>
            {user || 'Sem usuário'}
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px'
        }}>
          <span style={{ fontWeight: 600, fontSize: '1.1em' }}>Tema:</span>
          <span style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '5px 15px',
            borderRadius: '20px'
          }}>
            {theme === 'dark' ? 'Escuro' : 'Claro'}
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px'
        }}>
          <span style={{ fontWeight: 600, fontSize: '1.1em' }}>Contador Global:</span>
          <span style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '5px 15px',
            borderRadius: '20px'
          }}>
            {globalCounter}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente principal
function GlobalStateExercise() {
  return (
    <div>
      <h2>Exercício 2: Gerenciamento de Estado Global</h2>
      <p className="description">
        Demonstra o gerenciamento de estado global usando Context API.
        O estado é compartilhado entre múltiplos componentes.
      </p>

      <GlobalStateDisplay />

      <div className="exercise-container">
        <LoginComponent />
        <ThemeComponent />
        <GlobalCounterComponent />
      </div>

      <div className="code-explanation">
        <h3>Explicação do Código:</h3>
        <pre><code>{`// Criar Context
const AppContext = createContext();

// Provider
<AppContext.Provider value={state}>
  {children}
</AppContext.Provider>

// Consumir em qualquer componente
const { user, theme } = useApp();`}</code></pre>
      </div>
    </div>
  );
}

export default GlobalStateExercise;