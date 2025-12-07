// Model de Concelhos

import { pool } from '../db.js';
export const getAllCounties = async (distritoId = null) => {
  let query = `
    SELECT 
      c.id,
      c.codigo,
      c.nome,
      c.distrito_id,
      d.nome as distrito_nome,
      COUNT(DISTINCT cp.id) as num_codigos_postais
    FROM concelhos c
    JOIN distritos d ON c.distrito_id = d.id
    LEFT JOIN codigos_postais cp ON c.id = cp.concelho_id
  `;
  
  const params = [];
  
  if (distritoId) {
    query += ' WHERE c.distrito_id = ?';
    params.push(distritoId);
  }
  
  query += ' GROUP BY c.id, c.codigo, c.nome, c.distrito_id, d.nome ORDER BY c.nome ASC';
  
  const [rows] = await pool.query(query, params);
  return rows;
};

// Obter concelho por ID
export const getCountyById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      c.id,
      c.codigo,
      c.nome,
      c.distrito_id,
      d.nome as distrito_nome,
      COUNT(DISTINCT cp.id) as num_codigos_postais,
      SUM(cp.num_enderecos) as total_enderecos
    FROM concelhos c
    JOIN distritos d ON c.distrito_id = d.id
    LEFT JOIN codigos_postais cp ON c.id = cp.concelho_id
    WHERE c.id = ?
    GROUP BY c.id, c.codigo, c.nome, c.distrito_id, d.nome
  `, [id]);
  return rows[0] || null;
};

// Obter top concelhos por densidade de códigos postais
export const getTopCountiesByDensity = async (limit = 20) => {
  const [rows] = await pool.query(`
    SELECT 
      c.id,
      c.nome,
      d.nome as distrito_nome,
      COUNT(DISTINCT cp.id) as densidade,
      SUM(cp.num_enderecos) as total_enderecos
    FROM concelhos c
    JOIN distritos d ON c.distrito_id = d.id
    LEFT JOIN codigos_postais cp ON c.id = cp.concelho_id
    GROUP BY c.id, c.nome, d.nome
    ORDER BY densidade DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

// Obter estatísticas de concelhos por distrito
export const getCountyStatsByDistrict = async (distritoId) => {
  const [rows] = await pool.query(`
    SELECT 
      c.id,
      c.nome,
      COUNT(DISTINCT cp.id) as num_codigos_postais,
      SUM(cp.num_enderecos) as total_enderecos
    FROM concelhos c
    LEFT JOIN codigos_postais cp ON c.id = cp.concelho_id
    WHERE c.distrito_id = ?
    GROUP BY c.id, c.nome
    ORDER BY num_codigos_postais DESC
  `, [distritoId]);
  return rows;
};

export default {
  getAllCounties,
  getCountyById,
  getTopCountiesByDensity,
  getCountyStatsByDistrict
};