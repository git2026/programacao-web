/**
 * Exercício 1: Estado Local
 * Demonstra gerenciamento de estado local com useState
 */

import React, { useState } from 'react';

function LocalStateExercise() {
  // Estado local do contador
  const [count, setCount] = useState(0);
  
  // Estado local do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  // Funções do contador
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  // Handlers do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Dados do formulário:\nNome: ${formData.name}\nEmail: ${formData.email}`);
  };

  return (
    <div>
      <h2>Exercício 1: Gerenciamento de Estado Local</h2>
      <p className="description">
        Demonstra o gerenciamento de estado local usando o hook <code>useState</code>.
        O estado é confinado a este componente e não é compartilhado.
      </p>

      <div className="exercise-container">
        <div className="widget">
          <h3>Contador Interativo</h3>
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <span style={{ fontSize: '4em', fontWeight: 'bold', color: '#667eea' }}>
              {count}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
            <button className="btn btn-danger" onClick={decrement}>-</button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
            <button className="btn btn-success" onClick={increment}>+</button>
          </div>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#e3f2fd', 
            borderRadius: '5px',
            borderLeft: '4px solid #667eea'
          }}>
            <p style={{ color: '#1976d2', fontSize: '0.9em' }}>
              <strong>Estado Local:</strong> Este contador mantém seu próprio estado usando <code>useState</code>.
            </p>
          </div>
        </div>

        <div className="widget">
          <h3>Formulário com Estado Local</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name-input">Nome:</label>
              <input
                type="text"
                id="name-input"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-input">Email:</label>
              <input
                type="email"
                id="email-input"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
              />
            </div>
            <button type="submit" className="btn btn-primary">Enviar</button>
          </form>
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'white',
            borderRadius: '5px',
            border: '2px solid #e0e0e0'
          }}>
            <h4 style={{ color: '#667eea', marginBottom: '10px' }}>Preview do Estado:</h4>
            <p style={{ color: '#666' }}>
              {formData.name || formData.email ? (
                <>
                  <strong>Nome:</strong> {formData.name || 'Não preenchido'}<br />
                  <strong>Email:</strong> {formData.email || 'Não preenchido'}
                </>
              ) : (
                'Nenhum dado inserido ainda...'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="code-explanation">
        <h3>Explicação do Código:</h3>
        <pre><code>{`// Estado local usando useState
const [count, setCount] = useState(0);

// Atualizar estado
const increment = () => setCount(count + 1);

// Estado isolado - não afeta outros componentes`}</code></pre>
      </div>
    </div>
  );
}

export default LocalStateExercise;