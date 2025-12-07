// Model de Códigos Postais

import { pool } from '../db.js';

// Obter estatísticas gerais de códigos postais
export const getPostalCodeStats = async () => {
  const [rows] = await pool.query(`
    SELECT 
      COUNT(*) as total_codigos_postais,
      SUM(num_enderecos) as total_enderecos,
      AVG(num_enderecos) as media_enderecos_por_cp,
      COUNT(DISTINCT distrito_id) as total_distritos,
      COUNT(DISTINCT concelho_id) as total_concelhos
    FROM codigos_postais
  `);
  return rows[0] || null;
};

// Obter códigos postais por distrito
export const getPostalCodesByDistrict = async (distritoId, limit = 100) => {
  const [rows] = await pool.query(`
    SELECT 
      cp.id,
      cp.cp4,
      cp.cp3,
      cp.localidade,
      cp.num_enderecos,
      c.nome as concelho_nome,
      d.nome as distrito_nome
    FROM codigos_postais cp
    JOIN concelhos c ON cp.concelho_id = c.id
    JOIN distritos d ON cp.distrito_id = d.id
    WHERE cp.distrito_id = ?
    ORDER BY cp.num_enderecos DESC
    LIMIT ?
  `, [distritoId, limit]);
  return rows;
};

// Obter códigos postais por concelho
export const getPostalCodesByCounty = async (concelhoId, limit = 100) => {
  const [rows] = await pool.query(`
    SELECT 
      cp.id,
      cp.cp4,
      cp.cp3,
      cp.localidade,
      cp.num_enderecos,
      c.nome as concelho_nome,
      d.nome as distrito_nome
    FROM codigos_postais cp
    JOIN concelhos c ON cp.concelho_id = c.id
    JOIN distritos d ON cp.distrito_id = d.id
    WHERE cp.concelho_id = ?
    ORDER BY cp.num_enderecos DESC
    LIMIT ?
  `, [concelhoId, limit]);
  return rows;
};

// Pesquisar códigos postais
export const searchPostalCodes = async (searchTerm, limit = 50) => {
  const [rows] = await pool.query(`
    SELECT 
      cp.id,
      cp.cp4,
      cp.cp3,
      cp.localidade,
      cp.num_enderecos,
      c.nome as concelho_nome,
      d.nome as distrito_nome
    FROM codigos_postais cp
    JOIN concelhos c ON cp.concelho_id = c.id
    JOIN distritos d ON cp.distrito_id = d.id
    WHERE cp.localidade LIKE ? 
       OR CONCAT(cp.cp4, '-', cp.cp3) LIKE ?
       OR c.nome LIKE ?
       OR d.nome LIKE ?
    ORDER BY cp.num_enderecos DESC
    LIMIT ?
  `, [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    limit
  ]);
  return rows;
};

// Obter distribuição de endereços por distrito
export const getAddressDistributionByDistrict = async () => {
  const [rows] = await pool.query(`
    SELECT 
      d.nome as distrito,
      COUNT(cp.id) as num_codigos_postais,
      SUM(cp.num_enderecos) as total_enderecos,
      AVG(cp.num_enderecos) as media_enderecos
    FROM distritos d
    LEFT JOIN codigos_postais cp ON d.id = cp.distrito_id
    GROUP BY d.id, d.nome
    ORDER BY total_enderecos DESC
  `);
  return rows;
};

export default {
  getPostalCodeStats,
  getPostalCodesByDistrict,
  getPostalCodesByCounty,
  searchPostalCodes,
  getAddressDistributionByDistrict
};