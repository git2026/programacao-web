//Componente de Gráfico de Área
// Gráfico de área para visualização de volume/densidade

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Charts.module.css';
import { validateChartData, getEmptyDataMessage, EmptyChartMessage } from './chartUtils';

// Interface para configuração do gráfico de área
interface AreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey: string;
  title: string;
  height?: number;
  hasDataAvailable?: boolean;
  hasFiltersApplied?: boolean;
}

// Componente de Gráfico de Área
export default function AreaChart({ 
  data, 
  areas,
  xAxisKey, 
  title,
  height = 300,
  hasDataAvailable = true,
  hasFiltersApplied = false
}: AreaChartProps) {
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
        <RechartsAreaChart 
          data={validData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {areas.map((area, index) => (
              <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={area.color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{
                    backgroundColor: 'var(--color-card-bg, #ffffff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px'
                  }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} style={{ margin: '4px 0 0 0', color: entry.color }}>
                        {entry.name}: {entry.value?.toFixed(1)}%
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#color${index})`}
              connectNulls={true}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}