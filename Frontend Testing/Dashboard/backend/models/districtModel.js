// Model de Distritos

import { pool } from '../db.js';

// Obter todos os distritos
export const getAllDistricts = async () => {
  const [rows] = await pool.query(`
    SELECT 
      d.id,
      d.codigo,
      d.nome,
      COUNT(DISTINCT c.id) as num_concelhos,
      COUNT(DISTINCT cp.id) as num_codigos_postais
    FROM distritos d
    LEFT JOIN concelhos c ON d.id = c.distrito_id
    LEFT JOIN codigos_postais cp ON d.id = cp.distrito_id
    GROUP BY d.id, d.codigo, d.nome
    ORDER BY d.nome ASC
  `);
  return rows;
};

// Obter distrito por ID
export const getDistrictById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      d.id,
      d.codigo,
      d.nome,
      COUNT(DISTINCT c.id) as num_concelhos,
      COUNT(DISTINCT cp.id) as num_codigos_postais
    FROM distritos d
    LEFT JOIN concelhos c ON d.id = c.distrito_id
    LEFT JOIN codigos_postais cp ON d.id = cp.distrito_id
    WHERE d.id = ?
    GROUP BY d.id, d.codigo, d.nome
  `, [id]);
  return rows[0] || null;
};

// Obter estatísticas por distrito
export const getDistrictStats = async () => {
  const [rows] = await pool.query(`
    SELECT 
      d.id,
      d.nome,
      COUNT(DISTINCT c.id) as num_concelhos,
      COUNT(DISTINCT cp.id) as num_codigos_postais,
      SUM(cp.num_enderecos) as total_enderecos
    FROM distritos d
    LEFT JOIN concelhos c ON d.id = c.distrito_id
    LEFT JOIN codigos_postais cp ON d.id = cp.distrito_id
    GROUP BY d.id, d.nome
    ORDER BY num_codigos_postais DESC
    LIMIT 15
  `);
  return rows;
};

// Obter densidade de códigos postais por distrito
export const getDistrictDensity = async () => {
  const [rows] = await pool.query(`
    SELECT 
      d.nome as distrito,
      COUNT(DISTINCT cp.id) as densidade,
      SUM(cp.num_enderecos) as total_enderecos
    FROM distritos d
    LEFT JOIN codigos_postais cp ON d.id = cp.distrito_id
    GROUP BY d.id, d.nome
    ORDER BY densidade DESC
  `);
  return rows;
};

// Obter top distritos por critério
export const getTopDistricts = async (limit = 10, orderBy = 'codigos_postais') => {
  let orderColumn = 'num_codigos_postais';
  
  if (orderBy === 'concelhos') {
    orderColumn = 'num_concelhos';
  } else if (orderBy === 'enderecos') {
    orderColumn = 'total_enderecos';
  }
  
  const [rows] = await pool.query(`
    SELECT 
      d.id,
      d.nome,
      COUNT(DISTINCT c.id) as num_concelhos,
      COUNT(DISTINCT cp.id) as num_codigos_postais,
      SUM(cp.num_enderecos) as total_enderecos
    FROM distritos d
    LEFT JOIN concelhos c ON d.id = c.distrito_id
    LEFT JOIN codigos_postais cp ON d.id = cp.distrito_id
    GROUP BY d.id, d.nome
    ORDER BY ${orderColumn} DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

export default {
  getAllDistricts,
  getDistrictById,
  getDistrictStats,
  getDistrictDensity,
  getTopDistricts
};