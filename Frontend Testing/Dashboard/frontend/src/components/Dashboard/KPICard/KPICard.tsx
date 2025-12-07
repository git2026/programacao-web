// Componente de Cartão KPI
// Componente para exibir indicadores-chave de performance (KPI)

import styles from './KPICard.module.css';

// Interface para configuração do card KPI
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

// Componente de Cartão KPI
export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color = 'primary' 
}: KPICardProps) {

  // Renderização do card KPI
  return (
    <div className={`${styles.kpiCard} ${styles[color]}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      
      <div className={styles.value}>
        {typeof value === 'number' ? value.toLocaleString('pt-PT') : value}
      </div>
      
      {subtitle && (
        <div className={styles.subtitle}>{subtitle}</div>
      )}
      
      {trend && trendValue && (
        <div className={`${styles.trend} ${styles[`trend-${trend}`]}`}>
          <span className={styles.trendIcon}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
          <span className={styles.trendValue}>{trendValue}</span>
        </div>
      )}
    </div>
  );
}