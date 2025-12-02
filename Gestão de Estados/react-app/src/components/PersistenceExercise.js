/**
 * Exercício 4: Imutabilidade e Persistência
 * Demonstra persistência com localStorage e padrões imutáveis
 */

import React, { useState, useEffect } from 'react';

function PersistenceExercise() {
  // Estado inicial com rehydrate do localStorage
  const [savedData, setSavedData] = useState(() => {
    const saved = localStorage.getItem('persistence-exercise-data');
    return saved ? JSON.parse(saved) : {
      counter: 0,
      notes: [],
      preferences: {
        theme: 'light',
        notifications: true
      }
    };
  });

  // Salvar no localStorage sempre que o estado muda
  useEffect(() => {
    localStorage.setItem('persistence-exercise-data', JSON.stringify(savedData));
  }, [savedData]);

  // Atualizações imutáveis do contador
  const incrementCounter = () => {
    setSavedData(prevState => ({
      ...prevState,
      counter: prevState.counter + 1
    }));
  };

  const decrementCounter = () => {
    setSavedData(prevState => ({
      ...prevState,
      counter: prevState.counter - 1
    }));
  };

  // Adicionar nota (atualização imutável de array)
  const addNote = (noteText) => {
    if (noteText.trim()) {
      setSavedData(prevState => ({
        ...prevState,
        notes: [...prevState.notes, {
          id: Date.now(),
          text: noteText,
          createdAt: new Date().toLocaleString()
        }]
      }));
    }
  };

  // Remover nota (filtro imutável)
  const removeNote = (noteId) => {
    setSavedData(prevState => ({
      ...prevState,
      notes: prevState.notes.filter(note => note.id !== noteId)
    }));
  };

  // Atualizar preferências (imutabilidade)
  const updatePreferences = (key, value) => {
    setSavedData(prevState => ({
      ...prevState,
      preferences: {
        ...prevState.preferences,
        [key]: value
      }
    }));
  };

  // Limpar todos os dados
  const clearAllData = () => {
    localStorage.removeItem('persistence-exercise-data');
    setSavedData({
      counter: 0,
      notes: [],
      preferences: {
        theme: 'light',
        notifications: true
      }
    });
  };

  const [newNote, setNewNote] = useState('');

  return (
    <div>
      <h2>Exercício 4: Imutabilidade e Persistência de Estado</h2>
      <p className="description">
        Demonstra como persistir estado usando localStorage e implementar
        atualizações imutáveis usando o spread operator.
      </p>

      <div className="exercise-container">
        <div className="widget">
          <h3>Contador Persistente</h3>
          <p style={{ fontSize: '2em', textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>
            {savedData.counter}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
            <button className="btn btn-danger" onClick={decrementCounter}>-</button>
            <button className="btn btn-success" onClick={incrementCounter}>+</button>
          </div>
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '5px',
            borderLeft: '4px solid #667eea'
          }}>
            <p style={{ color: '#1976d2', fontSize: '0.9em' }}>
              <strong>Persistência:</strong> Este valor é salvo automaticamente no localStorage
              e será restaurado ao recarregar a página.
            </p>
          </div>
        </div>

        <div className="widget">
          <h3>Notas Persistentes</h3>
          <div className="form-group">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addNote(newNote);
                  setNewNote('');
                }
              }}
              placeholder="Digite uma nota e pressione Enter"
            />
          </div>
          <button className="btn btn-primary" onClick={() => {
            addNote(newNote);
            setNewNote('');
          }}>
            Adicionar Nota
          </button>

          <div style={{ marginTop: '20px' }}>
            {savedData.notes.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma nota salva ainda...</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {savedData.notes.map(note => (
                  <li key={note.id} style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: '#f5f5f5',
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{note.text}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{note.createdAt}</small>
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '0.8em' }}
                      onClick={() => removeNote(note.id)}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="widget">
          <h3>Preferências Persistentes</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={savedData.preferences.notifications}
                onChange={(e) => updatePreferences('notifications', e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Receber notificações
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Tema:</label>
            <select
              value={savedData.preferences.theme}
              onChange={(e) => updatePreferences('theme', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px'
              }}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
          <div className="success">
            <strong>Estado Atual:</strong>
            <pre style={{ marginTop: '10px', fontSize: '0.9em' }}>
              {JSON.stringify(savedData.preferences, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button className="btn btn-danger" onClick={clearAllData}>
          Limpar Todos os Dados (localStorage)
        </button>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9em' }}>
          Remove todos os dados salvos do localStorage
        </p>
      </div>

      <div className="code-explanation">
        <h3>Explicação do Código:</h3>
        <pre><code>{`// Rehydrate do localStorage
const [state, setState] = useState(() => {
  const saved = localStorage.getItem('app-data');
  return saved ? JSON.parse(saved) : initialState;
});

// Persistir no localStorage
useEffect(() => {
  localStorage.setItem('app-data', JSON.stringify(state));
}, [state]);

// Atualização imutável
setState(prevState => ({
  ...prevState,
  counter: prevState.counter + 1
}));`}</code></pre>
      </div>
    </div>
  );
}

export default PersistenceExercise;