/**Componente de Gráfico de Barras
 * Gráfico de barras para comparação de dados por categorias
 */

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import styles from './Charts.module.css';
import { CHART_COLORS, validateChartData, getEmptyDataMessage, EmptyChartMessage, formatYAxis, CustomTooltip } from './chartUtils';

// Interface para configuração das barras
interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
}

// Interface para configuração do gráfico de barras
interface BarChartProps {
  data: any[];
  dataKey?: string;
  bars?: BarConfig[];
  xAxisKey: string;
  title: string;
  color?: string;
  height?: number;
  isPercentage?: boolean;
  hasDataAvailable?: boolean;
  hasFiltersApplied?: boolean;
}

// Componente de Gráfico de Barras
export default function BarChart({ 
  data, 
  dataKey, 
  bars,
  xAxisKey, 
  title,
  color = '#3b82f6',
  height = 300,
  isPercentage = false,
  hasDataAvailable = true,
  hasFiltersApplied = false
}: BarChartProps) {
  const validData = validateChartData<any>(data, (item: any) => item && item[xAxisKey]);
  
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

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={validData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => formatYAxis(value, isPercentage)}
            domain={isPercentage ? [0, 100] : ['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip isPercentage={isPercentage} />} />
          <Legend />
          {bars ? (
            // Múltiplas barras
            bars.map((bar) => (
              <Bar 
                key={bar.dataKey} 
                dataKey={bar.dataKey} 
                name={bar.name}
                fill={bar.color} 
                radius={[4, 4, 0, 0]} 
              />
            ))
          ) : (
            // Barra única com cores diferentes por categoria
            <Bar dataKey={dataKey!} fill={color} radius={[8, 8, 0, 0]}>
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}