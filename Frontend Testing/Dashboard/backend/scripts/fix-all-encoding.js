// Script para corrigir encoding de todas as tabelas na base de dados

import { pool } from '../db.js';
import { fixStringEncoding } from '../utils/encodingFix.js';
import 'dotenv/config';

async function fixDistritosEncoding() {
  console.log('\nA corrigir encoding dos DISTRITOS...');
  let fixedCount = 0;

  try {
    const [distritos] = await pool.query('SELECT id, nome FROM distritos');
    console.log(`   Encontrados ${distritos.length} distritos.`);

    for (const distrito of distritos) {
      const originalName = distrito.nome;
      const fixedName = fixStringEncoding(originalName, { dictionary: 'districts' });

      if (originalName !== fixedName) {
        await pool.query('UPDATE distritos SET nome = ? WHERE id = ?', [fixedName, distrito.id]);
        fixedCount++;
        console.log(`   ID ${distrito.id}: '${originalName}' -> '${fixedName}'`);
      }
    }

    console.log(`   Distritos corrigidos: ${fixedCount}`);
    return fixedCount;
  } catch (error) {
    console.error('   Erro:', error.message);
    return 0;
  }
}

async function fixConcelhosEncoding() {
  console.log('\n  A corrigir encoding dos CONCELHOS...');
  let fixedCount = 0;

  try {
    const [concelhos] = await pool.query('SELECT id, nome FROM concelhos');
    console.log(`   Encontrados ${concelhos.length} concelhos.`);

    for (const concelho of concelhos) {
      const originalName = concelho.nome;
      const fixedName = fixStringEncoding(originalName);

      if (originalName !== fixedName) {
        await pool.query('UPDATE concelhos SET nome = ? WHERE id = ?', [fixedName, concelho.id]);
        fixedCount++;
        console.log(`    ID ${concelho.id}: '${originalName}' -> '${fixedName}'`);
      }
    }

    console.log(`    Concelhos corrigidos: ${fixedCount}`);
    return fixedCount;
  } catch (error) {
    console.error('    Erro:', error.message);
    return 0;
  }
}

async function fixCodigosPostaisEncoding() {
  console.log('\n A corrigir encoding dos CÓDIGOS POSTAIS...');
  let fixedCount = 0;
  const batchSize = 1000;

  try {
    // Contar total
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM codigos_postais');
    console.log(`   Encontrados ${total} códigos postais.`);

    if (total === 0) {
      console.log('     Nenhum código postal encontrado.');
      return 0;
    }

    // Processar em lotes para não sobrecarregar a memória
    let offset = 0;
    while (offset < total) {
      const [codigosPostais] = await pool.query(
        'SELECT id, localidade FROM codigos_postais LIMIT ? OFFSET ?',
        [batchSize, offset]
      );

      for (const cp of codigosPostais) {
        const originalLocalidade = cp.localidade;
        const fixedLocalidade = fixStringEncoding(originalLocalidade);

        if (originalLocalidade !== fixedLocalidade) {
          await pool.query(
            'UPDATE codigos_postais SET localidade = ? WHERE id = ?',
            [fixedLocalidade, cp.id]
          );
          fixedCount++;
        }
      }

      offset += batchSize;
      if (offset % 10000 === 0) {
        console.log(`   Processados ${offset}/${total} códigos postais...`);
      }
    }

    console.log(`    Códigos postais corrigidos: ${fixedCount}`);
    return fixedCount;
  } catch (error) {
    console.error('    Erro:', error.message);
    return 0;
  }
}

async function checkConcelhosIds() {
  console.log('\n A verificar IDs dos CONCELHOS...');

  try {
    const [[{ minId, maxId, total }]] = await pool.query(
      'SELECT MIN(id) as minId, MAX(id) as maxId, COUNT(*) as total FROM concelhos'
    );

    console.log(`   Min ID: ${minId}, Max ID: ${maxId}, Total: ${total}`);

    if (minId > 1) {
      console.log(`     IDs começam em ${minId} em vez de 1.`);
      console.log(`    Pode reiniciar os IDs com: npm run fix:concelho-ids`);
    } else {
      console.log(`    IDs estão corretos.`);
    }

    return { minId, maxId, total };
  } catch (error) {
    console.error('    Erro:', error.message);
    return null;
  }
}

async function resetConcelhosIds() {
  console.log('\n A reiniciar IDs dos CONCELHOS...');

  try {
    // Verificar se há concelhos
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM concelhos');
    if (total === 0) {
      console.log('     Nenhum concelho encontrado.');
      return;
    }

    // Verificar se há referências em códigos postais
    const [[{ cpRefs }]] = await pool.query('SELECT COUNT(*) as cpRefs FROM codigos_postais WHERE concelho_id IS NOT NULL');
    
    if (cpRefs > 0) {
      console.log(`     Há ${cpRefs} códigos postais referenciando concelhos.`);
      console.log('     Não é possível reiniciar IDs sem perder as referências.');
      console.log('     Sugestão: Reimporte os dados limpos do início.');
      return;
    }

    // Criar tabela temporária
    console.log('   Criando cópia temporária...');
    await pool.query(`
      CREATE TEMPORARY TABLE concelhos_temp AS 
      SELECT codigo, distrito_id, nome FROM concelhos ORDER BY codigo
    `);

    // Limpar tabela original
    console.log('   Limpando tabela original...');
    await pool.query('DELETE FROM concelhos');
    await pool.query('ALTER TABLE concelhos AUTO_INCREMENT = 1');

    // Reinserir dados
    console.log('   Reinserindo dados com IDs corretos...');
    await pool.query(`
      INSERT INTO concelhos (codigo, distrito_id, nome)
      SELECT codigo, distrito_id, nome FROM concelhos_temp
    `);

    // Limpar temporária
    await pool.query('DROP TEMPORARY TABLE concelhos_temp');

    const [[{ minId, maxId }]] = await pool.query(
      'SELECT MIN(id) as minId, MAX(id) as maxId FROM concelhos'
    );

    console.log(`    IDs reiniciados. Novo intervalo: ${minId} - ${maxId}`);
  } catch (error) {
    console.error('    Erro:', error.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔧 CORREÇÃO COMPLETA DE ENCODING E IDS');
  console.log('═══════════════════════════════════════════════════');

  const args = process.argv.slice(2);
  const resetIds = args.includes('--reset-ids');

  try {
    // Corrigir encoding
    const distritosFixed = await fixDistritosEncoding();
    const concelhosFixed = await fixConcelhosEncoding();
    const cpsFixed = await fixCodigosPostaisEncoding();

    // Verificar IDs
    const idsInfo = await checkConcelhosIds();

    // Reiniciar IDs se solicitado
    if (resetIds && idsInfo && idsInfo.minId > 1) {
      await resetConcelhosIds();
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(' RESUMO FINAL');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   Distritos corrigidos: ${distritosFixed}`);
    console.log(`   Concelhos corrigidos: ${concelhosFixed}`);
    console.log(`   Códigos postais corrigidos: ${cpsFixed}`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error(' Erro crítico:', error);
  } finally {
    await pool.end();
  }
}
main();