// Componente de Gráfico de Linha
// Gráfico de linha para tendências temporais

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Charts.module.css';
import { validateChartData, getEmptyDataMessage, EmptyChartMessage, formatYAxis, CustomTooltip } from './chartUtils';

// Interface para configuração do gráfico de linha
interface LineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey: string;
  title: string;
  height?: number;
  isPercentage?: boolean;
  hasDataAvailable?: boolean;
  hasFiltersApplied?: boolean;
}

// Componente de Gráfico de Linha
export default function LineChart({ 
  data, 
  lines,
  xAxisKey, 
  title,
  height = 300,
  isPercentage = false,
  hasDataAvailable = true,
  hasFiltersApplied = false
}: LineChartProps) {
  const validData = validateChartData<any>(data, (item: any) => item && item[xAxisKey] !== undefined);
  
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
        <RechartsLineChart 
          data={validData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => formatYAxis(value, isPercentage)}
            domain={isPercentage ? [0, 100] : ['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip isPercentage={isPercentage} />} />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}