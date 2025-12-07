// Controller para Dashboard Analytics

import * as districtModel from '../models/districtModel.js';
import * as countyModel from '../models/countyModel.js';
import * as postalCodeModel from '../models/postalCodeModel.js';
import * as transportModel from '../models/transportModel.js';
import { fixObjectEncoding } from '../utils/encodingFix.js';


// KPIs e Overview
// Retorna KPIs gerais do dashboard
export const getOverviewStats = async (req, res) => {
  try {
    const postalStats = await postalCodeModel.getPostalCodeStats();
    const transportOverview = await transportModel.getTransportOverview();
    
    // Calcular cobertura média de transportes
    const coberturaMedia = transportOverview.reduce((acc, t) => acc + parseFloat(t.cobertura_media), 0) / 
                          (transportOverview.length || 1);
    const totalRotas = transportOverview.reduce((acc, t) => acc + parseInt(t.total_rotas), 0);
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: {
        total_distritos: postalStats.total_distritos,
        total_concelhos: postalStats.total_concelhos,
        total_codigos_postais: postalStats.total_codigos_postais,
        total_enderecos: postalStats.total_enderecos,
        cobertura_media_transportes: parseFloat(coberturaMedia.toFixed(2)),
        total_rotas_transportes: totalRotas
      }
    });
  } catch (error) {
    console.error('Erro ao obter overview stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas gerais'
    });
  }
};


// Estatísticas por Distrito
// Retorna estatísticas agregadas por distrito
export const getStatsByDistrict = async (req, res) => {
  try {
    const { limit = 15, orderBy = 'codigos_postais' } = req.query;
    const districts = await districtModel.getTopDistricts(parseInt(limit), orderBy);
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(districts)
    });
  } catch (error) {
    console.error('Erro ao obter stats por distrito:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas por distrito'
    });
  }
};

// Retorna densidade de códigos postais por distrito
export const getDistrictDensity = async (req, res) => {
  try {
    const density = await districtModel.getDistrictDensity();
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(density)
    });
  } catch (error) {
    console.error('Erro ao obter densidade de distritos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter densidade de distritos'
    });
  }
};

// Estatísticas por Concelho
// Retorna top concelhos por densidade
export const getStatsByCounty = async (req, res) => {
  try {
    const { limit = 20, distrito_id } = req.query;
    
    // Obter concelhos
    let counties;
    if (distrito_id) {
      counties = await countyModel.getCountyStatsByDistrict(parseInt(distrito_id));
    } else {
      counties = await countyModel.getTopCountiesByDensity(parseInt(limit));
    }
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(counties)
    });
  } catch (error) {
    console.error('Erro ao obter stats por concelho:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas por concelho'
    });
  }
};

// Estatísticas de Transportes
// Retorna cobertura de transportes por distrito
export const getTransportCoverage = async (req, res) => {
  try {
    const { ano, tipo_transporte, distrito_id } = req.query;
    const parsedAno = ano ? parseInt(ano) : null;
    const parsedDistrito = distrito_id ? parseInt(distrito_id) : null;

    // Obter cobertura de transportes
    let coverage;
    if (parsedDistrito) {
      coverage = await transportModel.getTransportCoverageByDistrict(
        parsedAno,
        tipo_transporte || null,
        parsedDistrito
      );
    } else if (tipo_transporte) {
      coverage = await transportModel.getTopDistrictsByTransportCoverage(
        tipo_transporte, 
        parsedAno
      );
    } else {
      coverage = await transportModel.getTransportCoverageByDistrict(parsedAno);
    }
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(coverage)
    });
  } catch (error) {
    console.error('Erro ao obter cobertura de transportes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter cobertura de transportes'
    });
  }
};

// Retorna evolução temporal de transportes
export const getTransportTimeline = async (req, res) => {
  try {
    const { tipo_transporte, distrito_id } = req.query;
    const parsedDistrito = distrito_id ? parseInt(distrito_id) : null;
    
    const timeline = await transportModel.getTransportTimeline(tipo_transporte || null, parsedDistrito);
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Erro ao obter timeline de transportes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter timeline de transportes'
    });
  }
};

// Retorna distribuição percentual de tipos de transporte
export const getTransportDistribution = async (req, res) => {
  try {
    const { ano, distrito_id } = req.query;
    const parsedAno = ano ? parseInt(ano) : null;
    const parsedDistrito = distrito_id ? parseInt(distrito_id) : null;
    
    const distribution = await transportModel.getTransportTypeDistribution(parsedAno, parsedDistrito);
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Erro ao obter distribuição de transportes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter distribuição de transportes'
    });
  }
};

// Filtros e Listas
// Retorna opções disponíveis para filtros
export const getFilterOptions = async (req, res) => {
  try {
    const [districts, years, transportTypes] = await Promise.all([
      districtModel.getAllDistricts(),
      transportModel.getAvailableYears(),
      transportModel.getTransportTypes()
    ]);
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding({
        distritos: districts.map(d => ({ id: d.id, codigo: d.codigo, nome: d.nome })),
        anos: years,
        tipos_transporte: transportTypes
      })
    });
  } catch (error) {
    console.error('Erro ao obter opções de filtros:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter opções de filtros'
    });
  }
};

// Retorna lista de todos os distritos
export const getAllDistricts = async (req, res) => {
  try {
    const districts = await districtModel.getAllDistricts();
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(districts)
    });
  } catch (error) {
    console.error('Erro ao obter distritos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter lista de distritos'
    });
  }
};

// Retorna lista de concelhos (opcionalmente filtrados por distrito)
export const getAllCounties = async (req, res) => {
  try {
    const { distrito_id } = req.query;
    
    const counties = await countyModel.getAllCounties(
      distrito_id ? parseInt(distrito_id) : null
    );
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(counties)
    });
  } catch (error) {
    console.error('Erro ao obter concelhos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter lista de concelhos'
    });
  }
};

// Pesquisa códigos postais
export const searchPostalCodes = async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Termo de pesquisa deve ter pelo menos 2 caracteres'
      });
    }
    
    const results = await postalCodeModel.searchPostalCodes(q, parseInt(limit));
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(results)
    });
  } catch (error) {
    console.error('Erro ao pesquisar códigos postais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao pesquisar códigos postais'
    });
  }
};

// Retorna todos os registos de transportes (para exportação)
export const getAllTransports = async (req, res) => {
  try {
    const transports = await transportModel.getAllTransports();
    
    // Retorna com sucesso
    res.json({
      success: true,
      data: fixObjectEncoding(transports)
    });
  } catch (error) {
    console.error('Erro ao obter transportes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter transportes'
    });
  }
};

export default {
  getOverviewStats,
  getStatsByDistrict,
  getDistrictDensity,
  getStatsByCounty,
  getTransportCoverage,
  getTransportTimeline,
  getTransportDistribution,
  getFilterOptions,
  getAllDistricts,
  getAllCounties,
  searchPostalCodes,
  getAllTransports
};