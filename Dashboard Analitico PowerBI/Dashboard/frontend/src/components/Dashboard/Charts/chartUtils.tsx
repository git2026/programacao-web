//Utilitários compartilhados para componentes de gráficos

import React from 'react';

export const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

// Função para validar dados do gráfico
export function validateChartData<T>(
  data: T[] | undefined | null,
  validator: (item: T) => boolean
): T[] {
  return data?.filter(validator) || [];
}

// Função para obter mensagem de dados vazios
export function getEmptyDataMessage(
  hasDataAvailable: boolean,
  hasFiltersApplied: boolean
): string {
  return hasDataAvailable && hasFiltersApplied
    ? 'Sem dados disponíveis para os filtros selecionados'
    : 'Sem dados disponíveis';
}

// Interface para props da mensagem de dados vazios
interface EmptyChartMessageProps {
  message: string;
  height?: number;
}

// Função para exibir mensagem de dados vazios
export function EmptyChartMessage({ 
  message, 
  height = 300 
}: EmptyChartMessageProps) {
  return (
    <div style={{ 
      height, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'var(--color-text-secondary, #6b7280)'
    }}>
      {message}
    </div>
  );
}

// Função para formatar valores percentuais
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Função para formatar valores do eixo Y
export function formatYAxis(value: number, isPercentage: boolean): string {
  return isPercentage ? `${value}%` : value.toString();
}

// Interface para entrada do tooltip
interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

// Interface para props do tooltip personalizado
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  isPercentage?: boolean;
}

// Função para exibir tooltip personalizado
export function CustomTooltip({ 
  active, 
  payload, 
  label, 
  isPercentage = false 
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg, #ffffff)',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '10px'
    }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
      {payload.map((entry: TooltipEntry, index: number) => (
        <p key={index} style={{ margin: '4px 0 0 0', color: entry.color }}>
          {entry.name}: {isPercentage ? formatPercentage(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}