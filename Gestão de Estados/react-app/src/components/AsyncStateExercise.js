/**
 * Exercício 3: Estado Assíncrono
 * Demonstra gerenciamento de estado durante operações assíncronas
 */

import React, { useState, useEffect } from 'react';

function AsyncStateExercise() {
  // Estados para lista de utilizadores
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para detalhes do utilizador
  const [userId, setUserId] = useState(1);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Buscar lista de utilizadores
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar utilizadores');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar detalhes de um utilizador
  const fetchUserDetails = async (id) => {
    setLoadingDetails(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar detalhes');
      }
      
      const data = await response.json();
      setUserDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Buscar utilizadores ao montar componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Buscar detalhes quando userId muda
  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  return (
    <div>
      <h2>Exercício 3: Atualizações Assíncronas de Estado</h2>
      <p className="description">
        Demonstra como gerenciar estado durante operações assíncronas,
        incluindo estados de loading e tratamento de erros.
      </p>

      <div className="exercise-container">
        <div className="widget">
          <h3>Lista de Utilizadores (API Call)</h3>
          <button className="btn btn-primary" onClick={fetchUsers} disabled={loading}>
            {loading ? 'Carregando...' : 'Buscar Utilizadores'}
          </button>

          {loading && (
            <div className="loading">
              <p>Carregando utilizadores...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <strong>Erro:</strong> {error}
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Utilizadores encontrados: {users.length}</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.slice(0, 5).map(user => (
                  <li key={user.id} style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: '#f5f5f5',
                    borderRadius: '5px'
                  }}>
                    <strong>{user.name}</strong> - {user.email}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="widget">
          <h3>Detalhes do Utilizador (Async Fetch)</h3>
          <div className="form-group">
            <label htmlFor="user-id">ID do Utilizador (1-10):</label>
            <input
              type="number"
              id="user-id"
              min="1"
              max="10"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px'
              }}
            />
          </div>

          {loadingDetails && (
            <div className="loading">
              <p>Carregando detalhes do utilizador...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <strong>Erro:</strong> {error}
            </div>
          )}

          {!loadingDetails && !error && userDetails && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#e8f5e9',
              borderRadius: '5px',
              borderLeft: '4px solid #2e7d32'
            }}>
              <h4>{userDetails.name}</h4>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Telefone:</strong> {userDetails.phone}</p>
              <p><strong>Website:</strong> {userDetails.website}</p>
              <p><strong>Empresa:</strong> {userDetails.company?.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="code-explanation">
        <h3>Explicação do Código:</h3>
        <pre><code>{`// Estados para operações assíncronas
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Função assíncrona
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch(url);
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// useEffect para buscar ao montar
useEffect(() => {
  fetchData();
}, []);`}</code></pre>
      </div>
    </div>
  );
}

export default AsyncStateExercise;