// Componente de Gráfico de Pizza
// Gráfico de pizza/donut para distribuições percentuais

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Charts.module.css';
import { CHART_COLORS, validateChartData, getEmptyDataMessage, EmptyChartMessage } from './chartUtils';

// Interface para configuração do gráfico de pizza
interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  colors?: string[];
  innerRadius?: number;
  height?: number;
  hasDataAvailable?: boolean;
  hasFiltersApplied?: boolean;
}

// Componente de Gráfico de Pizza
export default function PieChart({
  data, 
  dataKey, 
  nameKey, 
  title,
  colors = CHART_COLORS,
  innerRadius = 0,
  height = 300,
  hasDataAvailable = true,
  hasFiltersApplied = false
}: PieChartProps) {

  // Validar dados do gráfico
  const validData = validateChartData<any>(data, (item: any) => item && item[dataKey] > 0);
  
  // Se não há dados válidos, mostrar mensagem
  if (validData.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <EmptyChartMessage 
          message={getEmptyDataMessage(hasDataAvailable, hasFiltersApplied)}
          height={height}
        />
      </div>
    );
  }

  // Renderização do gráfico de pizza
  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={validData}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            label={(entry) => {
              const value = entry[dataKey];
              return `${entry[nameKey]}: ${typeof value === 'number' ? value.toFixed(0) : value}`;
            }}
          >
            {validData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--color-card-bg, #ffffff)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}