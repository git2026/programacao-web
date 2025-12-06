/* Controller para Importação de Dados CSV*/
import { pool } from '../db.js';
import { fixStringEncoding, normalizeEncodingBlock } from '../utils/encodingFix.js';

// Limpa e normaliza o encoding do CSV para UTF-8
// Converte caracteres corrompidos e garante encoding correto
function cleanCSVEncoding(csvData) {
  if (!csvData || typeof csvData !== 'string') {
    return '';
  }
  return normalizeEncodingBlock(csvData.replace(/^\uFEFF/, ''));
}

// Limpa e normaliza um valor individual (nome, localidade, etc.)
// Aplica limpeza de encoding e remove caracteres inválidos
function cleanValue(value, options = {}) {
  if (!value || typeof value !== 'string') {
    return value;
  }

  let cleaned = value.trim();
  cleaned = fixStringEncoding(cleaned, options);
  cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned.trim();
}

// Importação de distritos
export const importDistritos = async (csvData) => {
  // Limpar encoding do CSV antes de processar
  const cleanedCSV = cleanCSVEncoding(csvData);
  const lines = cleanedCSV.split('\n').filter(line => line.trim());
  let imported = 0;
  let errors = [];
  
  for (const line of lines) {
    const [codigoRaw, nomeRaw] = line.split(',').map(v => v.trim());
    const codigo = cleanValue(codigoRaw);
    const nome = cleanValue(nomeRaw, { dictionary: 'districts' });
    if (!codigo || !nome) continue;
    try {
      await pool.query(
        'INSERT INTO distritos (codigo, nome) VALUES (?, ?) ON DUPLICATE KEY UPDATE nome = ?',
        [codigo, nome, nome]
      );
      imported++;
    } catch (error) {
      errors.push(`Erro ao importar distrito ${codigo}: ${error.message}`);
    }
  }
  return { imported, errors };
};


// Importação de concelhos
export const importConcelhos = async (csvData) => {
  // Limpar encoding do CSV antes de processar
  const cleanedCSV = cleanCSVEncoding(csvData);
  const lines = cleanedCSV.split('\n').filter(line => line.trim());
  let imported = 0;
  let errors = [];
  
  // Buscar mapeamento de distritos
  const [distritos] = await pool.query('SELECT id, codigo FROM distritos');
  const distritoMap = {};
  distritos.forEach(d => {
    distritoMap[d.codigo] = d.id;
  });
  
  for (const line of lines) {
    const [codigoConcelho, codigoDistrito, nome] = line.split(',').map(v => cleanValue(v.trim()));
    
    // Verificar se os campos estão presentes
    if (!codigoConcelho || !codigoDistrito || !nome) continue;
    
    // Obter ID do distrito
    const distritoId = distritoMap[codigoDistrito];

    // Verificar se o distrito existe
    if (!distritoId) {
      errors.push(`Distrito ${codigoDistrito} não encontrado para concelho ${nome}`);
      continue;
    }
    
    // Inserir concelho
    try {
      await pool.query(
        'INSERT INTO concelhos (codigo, distrito_id, nome) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nome = ?',
        [codigoConcelho, distritoId, nome, nome]
      );
      imported++;
    } catch (error) {
      errors.push(`Erro ao importar concelho ${nome}: ${error.message}`);
    }
  }
  
  return { imported, errors };
};

// Importação de códigos postais
export const importCodigosPostais = async (csvData) => {
  try {
    if (!csvData || typeof csvData !== 'string') {
      throw new Error('CSV data inválido ou vazio');
    }
    
    const cleanedCSV = cleanCSVEncoding(csvData);
    const lines = cleanedCSV.split('\n').filter(line => line.trim());
    let imported = 0;
    let skipped = 0;
    let errors = [];
  
  // Buscar mapeamento de distritos e concelhos
  const [distritos] = await pool.query('SELECT id, codigo FROM distritos');
  const distritoMap = {};
  distritos.forEach(d => {
    distritoMap[d.codigo] = d.id;
  });
  
  const [concelhos] = await pool.query('SELECT id, codigo, distrito_id FROM concelhos');
  const concelhoMap = {};
  concelhos.forEach(c => {
    const key = `${c.codigo}-${c.distrito_id}`;
    concelhoMap[key] = c.id;
  });
  
  const batchSize = 1000;
  const cpAggregation = {};
  
  // Processar em chunks para mostrar progresso
  const processChunkSize = 50000;
  let lastProgressLog = 0;
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    // Mostrar progresso a cada chunk
    if (lineIndex > 0 && lineIndex % processChunkSize === 0) {
      const progress = ((lineIndex / lines.length) * 100).toFixed(1);
      console.log(`[Import Codigos Postais] Progresso: ${progress}% (${lineIndex}/${lines.length} linhas)`);
    }
    const line = lines[lineIndex];
    const parts = line.split(',').map(v => v.trim());
    
    // Verificar se a linha tem colunas suficientes
    if (parts.length < 16) {
      skipped++;
      continue;
    }
    
    // Obter campos do CSV
    const codigoDistrito = parts[0];
    const codigoConcelho = parts[1];
    const localidadeRaw = parts[3];
    // Obter cp4 e cp3
    const cp4 = parts.length > 14 ? parts[14] : '';
    const cp3 = parts.length > 15 ? parts[15] : '';
    
    const localidade = cleanValue(localidadeRaw);
    
    if (!codigoDistrito || !codigoConcelho || !localidade || !cp4 || !cp3) {
      skipped++;
      continue;
    }
    
    // Validar e truncar cp4
    const cp4Clean = cp4.trim().replace(/\D/g, '').substring(0, 4);
    if (!cp4Clean || cp4Clean.length < 4) {
      skipped++;
      continue;
    }
    
    // Validar e truncar cp3
    const cp3Clean = cp3.trim().replace(/\D/g, '').substring(0, 3);
    if (!cp3Clean || cp3Clean.length < 3) {
      skipped++;
      continue;
    }
    
    // Obter ID do distrito
    const distritoId = distritoMap[codigoDistrito];
    if (!distritoId) {
      skipped++;
      continue;
    }
    
    // Obter ID do concelho
    const concelhoKey = `${codigoConcelho}-${distritoId}`;
    const concelhoId = concelhoMap[concelhoKey];
    
    // Verificar se o concelho existe
    if (!concelhoId) {
      skipped++;
      continue;
    }
    
    // Criar chave única para agregação
    const key = `${distritoId}-${concelhoId}-${cp4Clean}-${cp3Clean}-${localidade}`;
    
    // Adicionar ao agregador
    if (!cpAggregation[key]) {
      cpAggregation[key] = {
        distrito_id: distritoId,
        concelho_id: concelhoId,
        cp4: cp4Clean,
        cp3: cp3Clean,
        localidade: localidade,
        count: 1
      };
    } else {
      // Incrementar contador
      cpAggregation[key].count++;
    }
  }
  
  const entries = Object.values(cpAggregation);
  
  // Inserir em lotes
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const values = batch.map(cp => [
      cp.distrito_id,
      cp.concelho_id,
      cp.cp4,
      cp.cp3,
      cp.localidade,
      cp.count
    ]);
    
    try {
      await pool.query(
        'INSERT INTO codigos_postais (distrito_id, concelho_id, cp4, cp3, localidade, num_enderecos) VALUES ?',
        [values]
      );
      imported += batch.length;
      if (i % (batchSize * 10) === 0 || i + batchSize >= entries.length) {
        console.log(`[Import Codigos Postais] ${imported}/${entries.length} códigos postais importados`);
      }
    } catch (error) {
      console.error(`[Import Codigos Postais] Erro ao inserir lote ${i / batchSize + 1}:`, error);
      errors.push(`Erro ao inserir lote ${i / batchSize + 1}: ${error.message}`);
    }
  }
  
  return { imported, skipped, errors: errors.slice(0, 50) };
  
  } catch (error) {
    console.error('[Import Codigos Postais] ERRO CRÍTICO:', error);
    console.error('[Import Codigos Postais] Stack:', error.stack);
    throw error;
  }
};

// Importação de transportes
export const importTransportes = async (csvData) => {
  // Limpar encoding do CSV
  const cleanedCSV = cleanCSVEncoding(csvData);
  const lines = cleanedCSV.split('\n').filter(line => line.trim());
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  const [distritos] = await pool.query('SELECT id FROM distritos');
  const distritoIds = new Set(distritos.map(d => d.id));
  
  // Buscar mapeamento de concelhos
  const [concelhos] = await pool.query('SELECT id, distrito_id FROM concelhos');
  const concelhoMap = new Map();
  const concelhoIds = new Set();
  concelhos.forEach(c => {
    concelhoMap.set(c.id, c.distrito_id);
    concelhoIds.add(c.id);
  });
  
  const batchSize = 500;
  const batch = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(v => cleanValue(v.trim()));
    
    // Ignorar cabeçalho se existir (primeira linha que começa com "distrito_id")
    if (i === 0 && parts.length > 0) {
      const firstField = parts[0] ? parts[0].toLowerCase().trim() : '';
      if (firstField === 'distrito_id' || firstField === 'distrito') {
        continue;
      }
    }
    
    // Verificar se tem colunas suficientes
    if (parts.length < 6) {
      skipped++;
      continue;
    }

    // Obter campos do CSV
    // Formato esperado: distrito_id,concelho_id,tipo_transporte,cobertura_percent,num_rotas,ano
    // concelho_id pode estar vazio (será null)
    const distritoId = parseInt(parts[0]);
    const concelhoId = parts[1] && parts[1].trim() !== '' ? parseInt(parts[1]) : null;
    const tipoTransporte = parts[2];
    const coberturaPercent = parseFloat(parts[3]);
    const numRotas = parseInt(parts[4]);
    const ano = parseInt(parts[5]);
    
    // Validações básicas
    if (isNaN(distritoId) || !tipoTransporte || isNaN(coberturaPercent) || isNaN(numRotas) || isNaN(ano)) {
      skipped++;
      continue;
    }
    
    // Validar distrito existe
    if (!distritoIds.has(distritoId)) {
      errors.push(`Distrito ${distritoId} não encontrado (linha: ${line})`);
      skipped++;
      continue;
    }
    
    // Validar concelho_id se fornecido
    if (concelhoId !== null && !isNaN(concelhoId)) {
      if (!concelhoIds.has(concelhoId)) {
        errors.push(`Concelho ${concelhoId} não encontrado (linha: ${line})`);
        skipped++;
        continue;
      }
      // Verificar se o concelho pertence ao distrito
      const distritoDoConcelho = concelhoMap.get(concelhoId);
      if (distritoDoConcelho !== distritoId) {
        errors.push(`Concelho ${concelhoId} não pertence ao distrito ${distritoId} (linha: ${line})`);
        skipped++;
        continue;
      }
    }
    
    // Validar tipo de transporte
    const tiposValidos = ['metro', 'autocarro', 'comboio', 'ferry', 'outros'];
    if (!tiposValidos.includes(tipoTransporte.toLowerCase())) {
      errors.push(`Tipo de transporte inválido: ${tipoTransporte} (linha: ${line})`);
      skipped++;
      continue;
    }
    
    // Validar valores
    if (coberturaPercent < 0 || coberturaPercent > 100) {
      errors.push(`Cobertura inválida: ${coberturaPercent} (deve ser entre 0 e 100, linha: ${line})`);
      skipped++;
      continue;
    }
    
    // Validar número de rotas
    if (numRotas < 0) {
      errors.push(`Número de rotas inválido: ${numRotas} (deve ser >= 0, linha: ${line})`);
      skipped++;
      continue;
    }
    
    // Validar ano
    if (ano < 2010 || ano > 2030) {
      errors.push(`Ano inválido: ${ano} (linha: ${line})`);
      skipped++;
      continue;
    }
    
    // Adicionar ao batch
    batch.push({
      distrito_id: distritoId,
      concelho_id: concelhoId,
      tipo_transporte: tipoTransporte.toLowerCase(),
      cobertura_percent: coberturaPercent.toFixed(2),
      num_rotas: numRotas,
      ano: ano
    });
    
    // Inserir em lotes
    if (batch.length >= batchSize) {
      try {
        const values = batch.map(t => [
          t.distrito_id,
          t.concelho_id,
          t.tipo_transporte,
          t.cobertura_percent,
          t.num_rotas,
          t.ano
        ]);
        
        await pool.query(
          'INSERT INTO transportes (distrito_id, concelho_id, tipo_transporte, cobertura_percent, num_rotas, ano) VALUES ?',
          [values]
        );
        
        imported += batch.length;
        batch.length = 0;
      } catch (error) {
        console.error(`[Import Transportes] Erro ao inserir lote:`, error);
        errors.push(`Erro ao inserir lote: ${error.message}`);
        batch.length = 0;
      }
    }
  }
  
  // Inserir restante do batch
  if (batch.length > 0) {
    try {
      const values = batch.map(t => [
        t.distrito_id,
        t.concelho_id,
        t.tipo_transporte,
        t.cobertura_percent,
        t.num_rotas,
        t.ano
      ]);
      
      await pool.query(
        'INSERT INTO transportes (distrito_id, concelho_id, tipo_transporte, cobertura_percent, num_rotas, ano) VALUES ?',
        [values]
      );
      
      imported += batch.length;
    } catch (error) {
      console.error(`[Import Transportes] Erro ao inserir lote final:`, error);
      errors.push(`Erro ao inserir lote final: ${error.message}`);
    }
  }
  
  return { imported, skipped, errors };
};

// Endpoints principais
// Importa distritos a partir de CSV
export const handleImportDistritos = async (req, res) => {
  try {
    const { csvData } = req.body;
    
    // Verificar se o CSV data está presente
    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required'
      });
    }
    const result = await importDistritos(csvData);
    
    // Retorna com sucesso
    res.json({
      success: true,
      message: `${result.imported} distritos importados`,
      ...result
    });
  } catch (error) {
    console.error('Erro ao importar distritos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar distritos',
      details: error.message
    });
  }
};

// Importa concelhos a partir de CSV
export const handleImportConcelhos = async (req, res) => {
  try {
    const { csvData } = req.body;
    
    // Verificar se o CSV data está presente
    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required'
      });
    }
    const result = await importConcelhos(csvData);
    
    res.json({
      success: true,
      message: `${result.imported} concelhos importados`,
      ...result
    });
  } catch (error) {
    console.error('Erro ao importar concelhos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar concelhos',
      details: error.message
    });
  }
};

// Importa códigos postais a partir de CSV
export const handleImportCodigosPostais = async (req, res) => {
  try {
    // Verificar se o body está vazio ou undefined
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is missing. Verifique se o Content-Type está correto (application/json)'
      });
    }
    const { csvData } = req.body;
    
    // Verificar se o CSV data está presente
    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required. Envie { "csvData": "..." } no body'
      });
    }
    
    // Verificar se o CSV data é uma string
    if (typeof csvData !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'CSV data must be a string'
      });
    }
    
    // Processar com timeout de 25 minutos
    const processPromise = importCodigosPostais(csvData);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Processamento demorou mais de 25 minutos')), 25 * 60 * 1000);
    });
    
    const result = await Promise.race([processPromise, timeoutPromise]);
    
    // Retorna com sucesso
    res.json({
      success: true,
      message: `${result.imported} codigos postais importados (${result.skipped} ignorados)`,
      ...result
    });
  } catch (error) {
    console.error('Erro ao importar codigos postais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar codigos postais',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Importa transportes a partir de CSV
export const handleImportTransportes = async (req, res) => {
  try {
    const { csvData } = req.body;
    
    // Verificar se o CSV data está presente
    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required'
      });
    }
    const result = await importTransportes(csvData);
    
    // Retorna com sucesso
    res.json({
      success: true,
      message: `${result.imported} registos de transportes importados (${result.skipped} ignorados)`,
      ...result
    });
  } catch (error) {
    console.error('Erro ao importar transportes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar transportes',
      details: error.message
    });
  }
};

// Importa todos os dados de uma vez
export const handleImportAll = async (req, res) => {
  try {
    const { distritosCSV, concelhosCSV, codigosPostaisCSV, transportesCSV } = req.body;
    
    // Inicializar resultados
    const results = {
      distritos: { imported: 0, errors: [] },
      concelhos: { imported: 0, errors: [] },
      codigos_postais: { imported: 0, skipped: 0, errors: [] },
      transportes: { imported: 0, skipped: 0, errors: [] }
    };
    
    // Importar distritos
    if (distritosCSV) {
      results.distritos = await importDistritos(distritosCSV);
    }
    
    // Importar concelhos
    if (concelhosCSV) {
      results.concelhos = await importConcelhos(concelhosCSV);
    }
    
    // Importar códigos postais
    if (codigosPostaisCSV) {
      results.codigos_postais = await importCodigosPostais(codigosPostaisCSV);
    }
    
    // Importar transportes
    if (transportesCSV) {
      results.transportes = await importTransportes(transportesCSV);
    }
    
    // Retorna com sucesso
    res.json({
      success: true,
      message: 'Importacao completa!',
      results
    });
  } catch (error) {
    console.error('Erro ao importar todos os dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar dados',
      details: error.message
    });
  }
};

// Limpa todas as tabelas de dados (distritos, concelhos, codigos_postais, transportes)
export const handleClearTables = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Desativar verificação de foreign keys
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Limpar tabelas na ordem correta (primeiro as que têm foreign keys)
      await connection.query('TRUNCATE TABLE transportes');
      await connection.query('TRUNCATE TABLE codigos_postais');
      await connection.query('TRUNCATE TABLE concelhos');
      await connection.query('TRUNCATE TABLE distritos');
      
      // Fazer reset do AUTO_INCREMENT para 1
      await connection.query('ALTER TABLE transportes AUTO_INCREMENT = 1');
      await connection.query('ALTER TABLE codigos_postais AUTO_INCREMENT = 1');
      await connection.query('ALTER TABLE concelhos AUTO_INCREMENT = 1');
      await connection.query('ALTER TABLE distritos AUTO_INCREMENT = 1');
      
      // Reativar verificação de foreign keys
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      
      await connection.commit();
      
      // Verificar contagens das tabelas
      const [transportesCount] = await connection.query('SELECT COUNT(*) as count FROM transportes');
      const [codigosPostaisCount] = await connection.query('SELECT COUNT(*) as count FROM codigos_postais');
      const [concelhosCount] = await connection.query('SELECT COUNT(*) as count FROM concelhos');
      const [distritosCount] = await connection.query('SELECT COUNT(*) as count FROM distritos');
      
      connection.release();
      
      // Retorna com sucesso
      res.json({
        success: true,
        message: 'Todas as tabelas foram limpas com sucesso',
        counts: {
          transportes: transportesCount[0].count,
          codigos_postais: codigosPostaisCount[0].count,
          concelhos: concelhosCount[0].count,
          distritos: distritosCount[0].count
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao limpar tabelas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar tabelas',
      details: error.message
    });
  }
};

export default {
  handleImportDistritos,
  handleImportConcelhos,
  handleImportCodigosPostais,
  handleImportTransportes,
  handleImportAll,
  handleClearTables
};