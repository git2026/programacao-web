/* Model de Transportes */

import { pool } from '../db.js';

export const getTransportOverview = async (ano = null) => {
  let query = `
    SELECT 
      tipo_transporte,
      COUNT(*) as num_registos,
      AVG(cobertura_percent) as cobertura_media,
      SUM(num_rotas) as total_rotas
    FROM transportes
  `;
  
  const params = [];
  
  if (ano) {
    query += ' WHERE ano = ?';
    params.push(ano);
  }
  
  query += ' GROUP BY tipo_transporte ORDER BY cobertura_media DESC';
  
  const [rows] = await pool.query(query, params);
  return rows;
};

// Obter evolução temporal de cobertura por tipo de transporte
export const getTransportTimeline = async (tipoTransporte = null, distritoId = null) => {
  let query = `
    SELECT 
      ano,
      tipo_transporte,
      AVG(cobertura_percent) as cobertura_media,
      SUM(num_rotas) as total_rotas,
      COUNT(DISTINCT distrito_id) as num_distritos
    FROM transportes
    WHERE 1=1
  `;
  
  const params = [];
  
  if (tipoTransporte) {
    query += ' AND tipo_transporte = ?';
    params.push(tipoTransporte);
  }

  if (distritoId) {
    query += ' AND distrito_id = ?';
    params.push(distritoId);
  }
  
  query += ' GROUP BY ano, tipo_transporte ORDER BY ano ASC, tipo_transporte ASC';
  
  const [rows] = await pool.query(query, params);
  return rows;
};

// Obter cobertura de transportes por distrito
export const getTransportCoverageByDistrict = async (ano = null, tipoTransporte = null, distritoId = null, limit = 30) => {
  let query = `
    SELECT 
      d.id,
      d.nome as distrito,
      t.tipo_transporte,
      AVG(t.cobertura_percent) as cobertura_media,
      SUM(t.num_rotas) as total_rotas
    FROM distritos d
    JOIN transportes t ON d.id = t.distrito_id
  `;
  
  const params = [];
  const filters = [];
  
  if (distritoId) {
    filters.push('d.id = ?');
    params.push(distritoId);
  }
  
  if (ano) {
    filters.push('t.ano = ?');
    params.push(ano);
  }
  
  if (tipoTransporte) {
    filters.push('t.tipo_transporte = ?');
    params.push(tipoTransporte);
  }
  
  if (filters.length) {
    query += ` WHERE ${filters.join(' AND ')}`;
  }
  
  query += ' GROUP BY d.id, d.nome, t.tipo_transporte ORDER BY cobertura_media DESC';
  
  if (!distritoId) {
    query += ' LIMIT ?';
    params.push(limit);
  }
  
  const [rows] = await pool.query(query, params);
  return rows;
};

// Obter estatísticas de transportes por distrito específico
export const getTransportStatsByDistrict = async (distritoId, ano = null) => {
  let query = `
    SELECT 
      tipo_transporte,
      AVG(cobertura_percent) as cobertura_media,
      SUM(num_rotas) as total_rotas,
      ano
    FROM transportes
    WHERE distrito_id = ?
  `;
  
  const params = [distritoId];
  
  if (ano) {
    query += ' AND ano = ?';
    params.push(ano);
  }
  
  query += ' GROUP BY tipo_transporte, ano ORDER BY ano ASC, cobertura_media DESC';
  
  const [rows] = await pool.query(query, params);
  return rows;
};

// Obter distribuição percentual de tipos de transporte
export const getTransportTypeDistribution = async (ano = null, distritoId = null) => {
  const filters = [];
  const filterParams = [];

  if (ano) {
    filters.push('ano = ?');
    filterParams.push(ano);
  }

  if (distritoId) {
    filters.push('distrito_id = ?');
    filterParams.push(distritoId);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  // Primeiro, obter o total de rotas com os mesmos filtros
  const totalQuery = `SELECT SUM(num_rotas) as total_rotas FROM transportes ${whereClause}`;
  const [[{ total_rotas = 0 } = { total_rotas: 0 }]] = await pool.query(totalQuery, filterParams);
  
  // Calcular total como número para usar no cálculo de percentagem
  const totalRotas = Number(total_rotas) || 0;

  const [rows] = await pool.query(
    `
      SELECT 
        tipo_transporte,
        COUNT(*) as num_registos,
        AVG(cobertura_percent) as cobertura_media,
        SUM(num_rotas) as total_rotas
      FROM transportes
      ${whereClause}
      GROUP BY tipo_transporte
      ORDER BY total_rotas DESC
    `,
    filterParams
  );

  // Calcular percentagem no JavaScript para evitar problemas de parâmetros SQL
  return rows.map(row => ({
    ...row,
    percentagem_rotas: totalRotas > 0 ? (Number(row.total_rotas) * 100.0 / totalRotas) : 0
  }));
};

// Obter top distritos por cobertura de transporte
export const getTopDistrictsByTransportCoverage = async (tipoTransporte = null, ano = null, limit = 10) => {
  let query = `
    SELECT 
      d.nome as distrito,
      t.tipo_transporte,
      AVG(t.cobertura_percent) as cobertura_media,
      SUM(t.num_rotas) as total_rotas
    FROM distritos d
    JOIN transportes t ON d.id = t.distrito_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (tipoTransporte) {
    query += ' AND t.tipo_transporte = ?';
    params.push(tipoTransporte);
  }
  
  if (ano) {
    query += ' AND t.ano = ?';
    params.push(ano);
  }
  
  query += ' GROUP BY d.nome, t.tipo_transporte ORDER BY cobertura_media DESC LIMIT ?';
  params.push(limit);
  
  const [rows] = await pool.query(query, params);
  return rows;
};

// Obter anos disponíveis
export const getAvailableYears = async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT ano 
    FROM transportes 
    ORDER BY ano DESC
  `);
  return rows.map(r => r.ano);
};

// Obter tipos de transporte disponíveis
export const getTransportTypes = async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT tipo_transporte 
    FROM transportes 
    ORDER BY tipo_transporte ASC
  `);
  return rows.map(r => r.tipo_transporte);
};

// Obter todos os registos de transportes (para exportação)
export const getAllTransports = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id,
      distrito_id,
      concelho_id,
      tipo_transporte,
      cobertura_percent,
      num_rotas,
      ano
    FROM transportes 
    ORDER BY ano DESC, distrito_id ASC, tipo_transporte ASC
  `);
  return rows;
};

export default {
  getTransportOverview,
  getTransportTimeline,
  getTransportCoverageByDistrict,
  getTransportStatsByDistrict,
  getTransportTypeDistribution,
  getTopDistrictsByTransportCoverage,
  getAvailableYears,
  getTransportTypes,
  getAllTransports
};