/**Script para gerar dados fictícios de transportes
 * Este script gera dados realistas de transportes (2018-2024) para todos os distritos e concelhos
 * e guarda-os num ficheiro CSV (backend/data/transportes.csv)
*/

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync } from 'fs';
import mysql from 'mysql2/promise';

// Carregar .env do diretório backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');
config({ path: envPath });

// Configuração da base de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
});

async function generateTransportData() {
  try {
    console.log('A gerar dados ficticios de transportes...');
    
    const [distritos] = await pool.query('SELECT id, nome FROM distritos ORDER BY id');
    const [concelhos] = await pool.query('SELECT id, distrito_id FROM concelhos ORDER BY distrito_id, id');
    
    console.log(`Encontrados ${distritos.length} distritos e ${concelhos.length} concelhos`);
    
    // Criar mapa de distritos para concelhos
    const distritoConcelhos = {};
    for (const concelho of concelhos) {
      if (!distritoConcelhos[concelho.distrito_id]) {
        distritoConcelhos[concelho.distrito_id] = [];
      }
      distritoConcelhos[concelho.distrito_id].push(concelho.id);
    }
    
    console.log(`Distritos com concelhos: ${Object.keys(distritoConcelhos).length}`);
    
    const tiposTransporte = ['metro', 'autocarro', 'comboio', 'ferry', 'outros'];
    const anos = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    
    const csvLines = [];
    let generated = 0;
    
    for (const distrito of distritos) {
      const concelhosDoDistrito = distritoConcelhos[distrito.id] || [];
      
      // Se não houver concelhos, usar null
      if (concelhosDoDistrito.length === 0) {
        for (const ano of anos) {
          for (const tipo of tiposTransporte) {
            let cobertura = 0;
            let numRotas = 0;
            
            const isUrban = ['11', '13', '08', '06', '03'].includes(distrito.id.toString());
            
            if (tipo === 'metro') {
              cobertura = distrito.id === 11 ? Math.random() * 20 + 75 : 
                          distrito.id === 13 ? Math.random() * 15 + 60 : 
                          Math.random() * 5;
              numRotas = distrito.id === 11 ? Math.floor(Math.random() * 3) + 4 : 
                         distrito.id === 13 ? Math.floor(Math.random() * 3) + 6 : 
                         Math.random() > 0.9 ? 1 : 0;
            } else if (tipo === 'autocarro') {
              cobertura = isUrban ? Math.random() * 20 + 70 : Math.random() * 30 + 40;
              numRotas = isUrban ? Math.floor(Math.random() * 40) + 50 : Math.floor(Math.random() * 20) + 10;
            } else if (tipo === 'comboio') {
              cobertura = isUrban ? Math.random() * 30 + 50 : Math.random() * 40 + 20;
              numRotas = isUrban ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 8) + 3;
            } else if (tipo === 'ferry') {
              const isCoastal = [11, 15, 8, 1, 16, 31, 32].includes(distrito.id);
              cobertura = isCoastal ? Math.random() * 30 + 20 : 0;
              numRotas = isCoastal ? Math.floor(Math.random() * 5) + 2 : 0;
            } else {
              cobertura = Math.random() * 40 + 30;
              numRotas = Math.floor(Math.random() * 15) + 5;
            }
            
            const yearMultiplier = 1 + ((ano - 2018) * 0.03);
            cobertura = Math.min(100, cobertura * yearMultiplier);
            numRotas = Math.floor(numRotas * yearMultiplier);
            
            // Adicionar linha CSV sem concelho_id (formato: distrito_id,concelho_id,tipo,cobertura,num_rotas,ano)
            csvLines.push(`${distrito.id},,${tipo},${cobertura.toFixed(2)},${numRotas},${ano}`);
            generated++;
          }
        }
        continue;
      }
      
      // Gerar dados para TODOS os concelhos do distrito
      const concelhosSelecionados = concelhosDoDistrito;
      
      console.log(`Distrito ${distrito.id} (${distrito.nome}): ${concelhosSelecionados.length} concelhos`);
      
      for (const concelhoId of concelhosSelecionados) {
        for (const ano of anos) {
          for (const tipo of tiposTransporte) {
            let cobertura = 0;
            let numRotas = 0;
            
            const isUrban = ['11', '13', '08', '06', '03'].includes(distrito.id.toString());
            
            if (tipo === 'metro') {
              cobertura = distrito.id === 11 ? Math.random() * 20 + 75 : 
                          distrito.id === 13 ? Math.random() * 15 + 60 : 
                          Math.random() * 5;
              numRotas = distrito.id === 11 ? Math.floor(Math.random() * 3) + 4 : 
                         distrito.id === 13 ? Math.floor(Math.random() * 3) + 6 : 
                         Math.random() > 0.9 ? 1 : 0;
            } else if (tipo === 'autocarro') {
              cobertura = isUrban ? Math.random() * 20 + 70 : Math.random() * 30 + 40;
              numRotas = isUrban ? Math.floor(Math.random() * 40) + 50 : Math.floor(Math.random() * 20) + 10;
            } else if (tipo === 'comboio') {
              cobertura = isUrban ? Math.random() * 30 + 50 : Math.random() * 40 + 20;
              numRotas = isUrban ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 8) + 3;
            } else if (tipo === 'ferry') {
              const isCoastal = [11, 15, 8, 1, 16, 31, 32].includes(distrito.id);
              cobertura = isCoastal ? Math.random() * 30 + 20 : 0;
              numRotas = isCoastal ? Math.floor(Math.random() * 5) + 2 : 0;
            } else {
              cobertura = Math.random() * 40 + 30;
              numRotas = Math.floor(Math.random() * 15) + 5;
            }
            
            const yearMultiplier = 1 + ((ano - 2018) * 0.03);
            cobertura = Math.min(100, cobertura * yearMultiplier);
            numRotas = Math.floor(numRotas * yearMultiplier);
            
            // Adicionar linha CSV com concelho_id (formato: distrito_id,concelho_id,tipo,cobertura,num_rotas,ano)
            csvLines.push(`${distrito.id},${concelhoId},${tipo},${cobertura.toFixed(2)},${numRotas},${ano}`);
            generated++;
          }
        }
      }
    }
    
    // Escrever ficheiro CSV
    const csvPath = resolve(__dirname, '../data/transportes.csv');
    const csvContent = csvLines.join('\n');
    writeFileSync(csvPath, csvContent, 'utf8');
    
    console.log(`${generated} registos de transportes gerados`);
    console.log(`Ficheiro CSV criado: ${csvPath}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao gerar dados:', error);
    await pool.end();
    process.exit(1);
  }
}

generateTransportData();