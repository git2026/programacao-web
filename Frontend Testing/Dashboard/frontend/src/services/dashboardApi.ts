/**Serviço de API para Dashboard
 * Funções para obter dados do backend de transportes
 */

import { fixObjectEncoding } from '../utils/encodingFix';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interface para resposta da API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interface para estatísticas resumidas do dashboard
export interface OverviewStats {
  total_distritos: number;
  total_concelhos: number;
  total_codigos_postais: number;
  total_enderecos: number;
  cobertura_media_transportes: number;
  total_rotas_transportes: number;
}

// Interface para estatísticas por distrito
export interface DistrictStat {
  id: number;
  nome: string;
  num_concelhos: number;
  num_codigos_postais: number;
  total_enderecos: number;
}

// Interface para densidade de códigos postais por distrito
export interface DensityData {
  distrito: string;
  densidade: number;
  total_enderecos: number;
}

// Interface para cobertura de transportes por distrito
export interface TransportCoverage {
  id?: number;
  distrito: string;
  tipo_transporte: string;
  cobertura_media: number;
  total_rotas: number;
}

// Interface para evolução temporal de transportes
export interface TransportTimeline {
  ano: number;
  tipo_transporte: string;
  cobertura_media: number;
  total_rotas: number;
  num_distritos: number;
}

// Interface para distribuição de tipos de transporte
export interface TransportDistribution {
  tipo_transporte: string;
  num_registos: number;
  cobertura_media: number;
  total_rotas: number;
  percentagem_rotas: number;
}

// Interface para distrito
export interface District {
  id: number;
  codigo: string;
  nome: string;
  num_concelhos?: number;
  num_codigos_postais?: number;
}

// Interface para concelho
export interface County {
  id: number;
  codigo: string;
  nome: string;
  distrito_id: number;
  distrito_nome: string;
  num_codigos_postais: number;
}

// Interface para opções de filtros
export interface FilterOptions {
  distritos: District[];
  anos: number[];
  tipos_transporte: string[];
}

// Função auxiliar para fazer fetch com tratamento de erros (API)
async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido');
    }
    
    // Corrigir encoding dos dados recebidos
    return fixObjectEncoding(result.data) as T;
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error);
    throw error;
  }
}


// Funções de API

// Obter KPIs
export async function getOverviewStats(): Promise<OverviewStats> {
  return fetchApi<OverviewStats>('/dashboard/stats/resumo');
}

// Obter estatísticas por distrito
export async function getStatsByDistrict(limit = 15, orderBy = 'codigos_postais'): Promise<DistrictStat[]> {
  return fetchApi<DistrictStat[]>(`/dashboard/stats/por-distrito?limit=${limit}&orderBy=${orderBy}`);
}

// Obter densidade de códigos postais por distrito
export async function getDistrictDensity(): Promise<DensityData[]> {
  return fetchApi<DensityData[]>('/dashboard/stats/densidade-distrito');
}

// Obter cobertura de transportes por distrito
export interface TransportFilterParams {
  ano?: number;
  tipoTransporte?: string;
  distritoId?: number;
}

// Obter cobertura de transportes por distrito
export async function getTransportCoverage(params: TransportFilterParams = {}): Promise<TransportCoverage[]> {
  let endpoint = '/dashboard/stats/cobertura-transportes';
  const searchParams = new URLSearchParams();
  
  if (params.ano) searchParams.append('ano', params.ano.toString());
  if (params.tipoTransporte) searchParams.append('tipo_transporte', params.tipoTransporte);
  if (params.distritoId) searchParams.append('distrito_id', params.distritoId.toString());
  
  if ([...searchParams.keys()].length) {
    endpoint += `?${searchParams.toString()}`;
  }
  
  return fetchApi<TransportCoverage[]>(endpoint);
}

// Obter evolução temporal de transportes
export async function getTransportTimeline(params: TransportFilterParams = {}): Promise<TransportTimeline[]> {
  let endpoint = '/dashboard/stats/evolucao-transportes';
  const searchParams = new URLSearchParams();
  
  if (params.tipoTransporte) searchParams.append('tipo_transporte', params.tipoTransporte);
  if (params.distritoId) searchParams.append('distrito_id', params.distritoId.toString());
  
  if ([...searchParams.keys()].length) {
    endpoint += `?${searchParams.toString()}`;
  }
  
  return fetchApi<TransportTimeline[]>(endpoint);
}

// Obter distribuição de tipos de transporte
export async function getTransportDistribution(params: TransportFilterParams = {}): Promise<TransportDistribution[]> {
  let endpoint = '/dashboard/stats/distribuicao-transportes';
  const searchParams = new URLSearchParams();
  
  if (params.ano) searchParams.append('ano', params.ano.toString());
  if (params.distritoId) searchParams.append('distrito_id', params.distritoId.toString());
  
  if ([...searchParams.keys()].length) {
    endpoint += `?${searchParams.toString()}`;
  }
  
  return fetchApi<TransportDistribution[]>(endpoint);
}

// Obter opções para filtros
export async function getFilterOptions(): Promise<FilterOptions> {
  return fetchApi<FilterOptions>('/dashboard/filtros');
}

// Obter lista de distritos
export async function getAllDistricts(): Promise<District[]> {
  return fetchApi<District[]>('/dashboard/distritos');
}

// Obter lista de concelhos (opcionalmente filtrados por distrito)
export async function getAllCounties(distritoId?: number): Promise<County[]> {
  let endpoint = '/dashboard/concelhos';
  
  if (distritoId) {
    endpoint += `?distrito_id=${distritoId}`;
  }
  
  return fetchApi<County[]>(endpoint);
}

export default {
  getOverviewStats,
  getStatsByDistrict,
  getDistrictDensity,
  getTransportCoverage,
  getTransportTimeline,
  getTransportDistribution,
  getFilterOptions,
  getAllDistricts,
  getAllCounties
};