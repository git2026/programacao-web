/**Componente de Filtros do Dashboard
 * Componente para filtros interativos do dashboard
 */

import { useEffect, useState } from 'react';
import { getFilterOptions, type FilterOptions } from '../../../services/dashboardApi';
import styles from './DashboardFilters.module.css';

// Interface para configuração dos filtros
interface DashboardFiltersProps {
  onFilterChange: (filters: DashboardFilterState) => void;
}

// Interface para estado dos filtros
export interface DashboardFilterState {
  distrito?: number;
  ano?: number;
  tipoTransporte?: string;
}

// Componente de Filtros do Dashboard
export default function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedDistrito, setSelectedDistrito] = useState<number | undefined>(undefined);
  const [selectedAno, setSelectedAno] = useState<number | undefined>(undefined);
  const [selectedTipoTransporte, setSelectedTipoTransporte] = useState<string | undefined>(undefined);

  // Carregar opções de filtros
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Atualizar filtros
  useEffect(() => {
    onFilterChange({
      distrito: selectedDistrito,
      ano: selectedAno,
      tipoTransporte: selectedTipoTransporte
    });
  }, [selectedDistrito, selectedAno, selectedTipoTransporte]);

  // Carregar opções de filtros
  async function loadFilterOptions() {
    try {
      const options = await getFilterOptions();
      // Verificar encoding dos distritos
      if (options.distritos) {
        options.distritos.forEach(d => {
          if (d.nome && (d.nome.includes('ï¿½') || d.nome.includes(''))) {
            console.warn('Distrito com encoding corrompido:', d.nome);
          }
        });
      }
      setFilterOptions(options);
    } catch (error) {
      console.error('Erro ao carregar opções de filtros:', error);
    } finally {
      setLoading(false);
    }
  }

  // Reset de filtros
  function handleReset() {
    setSelectedDistrito(undefined);
    setSelectedAno(undefined);
    setSelectedTipoTransporte(undefined);
  }

  // Renderização dos filtros
  if (loading) {
    return (
      <div className={styles.filtersContainer}>
        <div className={styles.loading}>A carregar filtros...</div>
      </div>
    );
  }

  if (!filterOptions) {
    return null;
  }

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label htmlFor="filter-distrito" className={styles.filterLabel}>
          Distrito
        </label>
        <select
          id="filter-distrito"
          className={styles.filterSelect}
          value={selectedDistrito || ''}
          onChange={(e) => setSelectedDistrito(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">Todos os Distritos</option>
          {filterOptions.distritos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-ano" className={styles.filterLabel}>
          Ano
        </label>
        <select
          id="filter-ano"
          className={styles.filterSelect}
          value={selectedAno || ''}
          onChange={(e) => setSelectedAno(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">Todos os Anos</option>
          {filterOptions.anos.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="filter-transporte" className={styles.filterLabel}>
          Tipo de Transporte
        </label>
        <select
          id="filter-transporte"
          className={styles.filterSelect}
          value={selectedTipoTransporte || ''}
          onChange={(e) => setSelectedTipoTransporte(e.target.value || undefined)}
        >
          <option value="">Todos os Tipos</option>
          {filterOptions.tipos_transporte.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <button 
          className={styles.resetButton}
          onClick={handleReset}
          aria-label="Limpar filtros"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}