// Página do Dashboard
// Página principal do dashboard analítico de transportes

import { useState, useEffect, useCallback } from 'react';
import KPICard from '../../components/Dashboard/KPICard/KPICard';
import BarChart from '../../components/Dashboard/Charts/BarChart';
import LineChart from '../../components/Dashboard/Charts/LineChart';
import PieChart from '../../components/Dashboard/Charts/PieChart';
import DashboardFilters, { type DashboardFilterState } from '../../components/Dashboard/Filters/DashboardFilters';
import * as dashboardApi from '../../services/dashboardApi';
import styles from './Dashboard.module.css';

// Componente de Dashboard
export default function Dashboard() {
  // Estados para dados
  const [overviewStats, setOverviewStats] = useState<dashboardApi.OverviewStats | null>(null);
  const [districtStats, setDistrictStats] = useState<dashboardApi.DistrictStat[]>([]);
  const [transportTimeline, setTransportTimeline] = useState<dashboardApi.TransportTimeline[]>([]);
  const [transportDistribution, setTransportDistribution] = useState<dashboardApi.TransportDistribution[]>([]);
  const [transportCoverage, setTransportCoverage] = useState<dashboardApi.TransportCoverage[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilterState>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadFilteredData = useCallback(async () => {
    try {
      // Carregar dados que mudam com os filtros (em background, sem indicador visual)
      const transportParams: dashboardApi.TransportFilterParams = {
        ano: filters.ano,
        tipoTransporte: filters.tipoTransporte,
        distritoId: filters.distrito
      };

      const [timeline, distribution, coverage, districts] = await Promise.all([
        dashboardApi.getTransportTimeline(transportParams),
        dashboardApi.getTransportDistribution(transportParams),
        dashboardApi.getTransportCoverage(transportParams),
        // Se houver filtro de distrito, filtrar apenas esse distrito
        filters.distrito 
          ? dashboardApi.getStatsByDistrict(20, 'codigos_postais').then(ds => 
              ds.filter(d => d.id === filters.distrito)
            )
          : dashboardApi.getStatsByDistrict(10, 'codigos_postais')
      ]);

      // Atualizar todos os dados
      setTransportTimeline(timeline);
      setTransportDistribution(distribution);
      setTransportCoverage(coverage);
      setDistrictStats(districts);

    } catch (err) {
      console.error('Erro ao carregar dados filtrados:', err);
    }
  }, [filters]);

  useEffect(() => {
    // Atualizar dados em tempo real quando os filtros mudam
    // Só atualizar se não for o carregamento inicial
    if (!loading) {
      loadFilteredData();
    }
  }, [filters, loading]);

  // Carregar dados do dashboard
  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Carregar TODOS os dados na inicialização (incluindo transportes)
      const [overview, districts, timeline, distribution, coverage] = await Promise.all([
        dashboardApi.getOverviewStats(),
        dashboardApi.getStatsByDistrict(10, 'codigos_postais'),
        dashboardApi.getTransportTimeline(),
        dashboardApi.getTransportDistribution(),
        dashboardApi.getTransportCoverage()
      ]);

      setOverviewStats(overview);
      setDistrictStats(districts);
      setTransportTimeline(timeline);
      setTransportDistribution(distribution);
      setTransportCoverage(coverage);

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Não foi possível carregar os dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }


  // Atualizar filtros
  function handleFilterChange(newFilters: DashboardFilterState) {
    setFilters(newFilters);
  }

  // Preparar dados para gráfico de linha
  const timelineData = prepareTimelineData(transportTimeline);

  // Preparar dados para gráfico de barras (top 10 distritos)
  const barChartData = districtStats.slice(0, 10).map(d => ({
    nome: d.nome,
    densidade: d.num_codigos_postais
  }));

  // Título dinâmico para gráfico de barras
  const getBarChartTitle = () => {
    return filters.distrito 
      ? 'Densidade de Códigos Postais'
      : 'Top 10 Distritos por Densidade de Códigos Postais';
  };

  // Preparar dados para gráfico de pizza (distribuição de transportes)
  const pieChartData = transportDistribution.map(t => ({
    name: t.tipo_transporte.charAt(0).toUpperCase() + t.tipo_transporte.slice(1),
    value: parseFloat(t.total_rotas.toString()),
    percentagem: parseFloat(t.percentagem_rotas?.toString() || '0')
  }));

  // Verificar se há dados disponíveis na base de dados
  const hasDataAvailable = overviewStats !== null && (
    overviewStats.total_distritos > 0 ||
    overviewStats.total_concelhos > 0 ||
    overviewStats.total_codigos_postais > 0
  );

  // Verificar se há filtros aplicados
  const hasFiltersApplied = !!(filters.distrito || filters.ano || filters.tipoTransporte);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadDashboardData}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Filtros */}
      <DashboardFilters onFilterChange={handleFilterChange} />

      {/* KPIs */}
      {overviewStats && (
        <div className={styles.kpiGrid}>
          <KPICard
            title="Total de Distritos"
            value={overviewStats.total_distritos}
            icon="📍"
            color="primary"
          />
          <KPICard
            title="Total de Concelhos"
            value={overviewStats.total_concelhos}
            icon="🏘️"
            color="secondary"
          />
          <KPICard
            title="Códigos Postais"
            value={overviewStats.total_codigos_postais}
            icon="📮"
            color="success"
          />
          <KPICard
            title="Cobertura Média"
            value={`${overviewStats.cobertura_media_transportes.toFixed(1)}%`}
            subtitle="Transportes Públicos"
            icon="🚌"
            color="warning"
          />
        </div>
      )}

      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de Barras - Densidade por Distrito */}
        <div className={styles.chartItem}>
          <BarChart
            data={barChartData}
            dataKey="densidade"
            xAxisKey="nome"
            title={getBarChartTitle()}
            color="#3b82f6"
            height={350}
            hasDataAvailable={hasDataAvailable}
            hasFiltersApplied={hasFiltersApplied}
          />
        </div>

        {/* Gráfico de Pizza - Distribuição de Transportes */}
        <div className={styles.chartItem}>
          <PieChart
            data={pieChartData}
            dataKey="value"
            nameKey="name"
            title="Distribuição de Rotas por Tipo de Transporte"
            innerRadius={60}
            height={350}
            hasDataAvailable={hasDataAvailable}
            hasFiltersApplied={hasFiltersApplied}
          />
        </div>

        {/* Gráfico de Linha - Evolução Temporal */}
        <div className={styles.chartItemWide}>
          <LineChart
            data={timelineData}
            lines={getTimelineLines(transportTimeline)}
            xAxisKey="ano"
            title={getTimelineTitle(filters)}
            height={350}
            isPercentage={true}
            hasDataAvailable={hasDataAvailable}
            hasFiltersApplied={hasFiltersApplied}
          />
        </div>

        {/* Gráfico de Barras - Cobertura por Distrito/Tipo */}
        <div className={styles.chartItemWide}>
          <BarChart
            data={prepareCoverageBarData(transportCoverage, !!filters.distrito)}
            bars={getCoverageBars()}
            xAxisKey="categoria"
            title={filters.distrito 
              ? "Cobertura por Tipo de Transporte" 
              : "Cobertura de Transportes por Distrito"}
            height={350}
            isPercentage={true}
            hasDataAvailable={hasDataAvailable}
            hasFiltersApplied={hasFiltersApplied}
          />
        </div>
      </div>

    </div>
  );
}

// Funções auxiliares para preparar dados para os gráficos
function prepareTimelineData(timeline: dashboardApi.TransportTimeline[]) {
  const dataByYear = timeline.reduce((acc, item) => {
    if (!acc[item.ano]) {
      acc[item.ano] = { ano: item.ano };
    }
    acc[item.ano][item.tipo_transporte] = parseFloat(item.cobertura_media.toString());
    return acc;
  }, {} as Record<number, any>);

  return Object.values(dataByYear).sort((a, b) => a.ano - b.ano);
}

// Preparar dados para gráfico de linha
function getTimelineLines(timeline: dashboardApi.TransportTimeline[]) {
  const types = [...new Set(timeline.map(t => t.tipo_transporte))];
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
  
  return types.map((type, index) => ({
    dataKey: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    color: colors[index % colors.length]
  }));
}

// Preparar dados para gráfico de barras de cobertura
function getCoverageBars() {
  return [
    { dataKey: 'autocarro', name: 'Autocarro', color: '#3b82f6' },
    { dataKey: 'comboio', name: 'Comboio', color: '#10b981' },
    { dataKey: 'metro', name: 'Metro', color: '#8b5cf6' },
    { dataKey: 'ferry', name: 'Ferry', color: '#f59e0b' },
    { dataKey: 'outros', name: 'Outros', color: '#ef4444' }
  ];
}

// Preparar dados para gráfico de barras de cobertura
function prepareCoverageBarData(coverage: dashboardApi.TransportCoverage[], singleDistrict: boolean): any[] {
  if (!coverage || coverage.length === 0) return [];
  
  const allTypes = ['autocarro', 'comboio', 'metro', 'ferry', 'outros'];
  
  if (singleDistrict) {
    // Quando um distrito é selecionado: mostrar tipos no eixo X
    return allTypes.map(tipo => {
      const item = coverage.find(c => c.tipo_transporte === tipo);
      const cobertura = item ? parseFloat(item.cobertura_media?.toString() || '0') : 0;
      return {
        categoria: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        autocarro: tipo === 'autocarro' ? cobertura : 0,
        comboio: tipo === 'comboio' ? cobertura : 0,
        metro: tipo === 'metro' ? cobertura : 0,
        ferry: tipo === 'ferry' ? cobertura : 0,
        outros: tipo === 'outros' ? cobertura : 0
      };
    });
  }
  
  // Sem filtro de distrito: agrupar por distrito, mostrar todos os tipos
  const dataByDistrict = coverage.reduce((acc, item) => {
    if (!item.distrito) return acc;
    
    if (!acc[item.distrito]) {
      acc[item.distrito] = { 
        categoria: item.distrito,
        autocarro: 0,
        comboio: 0,
        metro: 0,
        ferry: 0,
        outros: 0
      };
    }
    
    const value = parseFloat(item.cobertura_media?.toString() || '0');
    if (allTypes.includes(item.tipo_transporte)) {
      acc[item.distrito][item.tipo_transporte] = isNaN(value) ? 0 : value;
    }
    return acc;
  }, {} as Record<string, any>);

  // Ordenar por nome de distrito e limitar a 10
  return Object.values(dataByDistrict)
    .sort((a, b) => a.categoria.localeCompare(b.categoria))
    .slice(0, 10);
}

// Título dinâmico para gráfico de evolução temporal
function getTimelineTitle(filters: DashboardFilterState) {
  const parts = ['Evolução da Cobertura de Transportes'];
  
  if (filters.ano) {
    // Se um ano específico está selecionado, mostrar comparação por tipo
    parts.push(`(${filters.ano})`);
  } else {
    parts.push('(2018-2024)');
  }
  
  // Se um tipo de transporte específico está selecionado, mostrar o tipo
  if (filters.tipoTransporte) {
    parts.push(`- ${filters.tipoTransporte.charAt(0).toUpperCase() + filters.tipoTransporte.slice(1)}`);
  }
  return parts.join(' ');
}