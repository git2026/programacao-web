-- ===========================================
-- SCRIPT SQL BD - DASHBOARD TRANSPORTES
-- ===========================================

CREATE DATABASE IF NOT EXISTS dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE dashboard;

-- ===========================================
-- TABELAS
-- ===========================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'guest') DEFAULT 'guest',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS distritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(2) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS concelhos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(2) NOT NULL,
  distrito_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (distrito_id) REFERENCES distritos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_concelho_distrito (codigo, distrito_id)
);

CREATE TABLE IF NOT EXISTS codigos_postais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  distrito_id INT NOT NULL,
  concelho_id INT NOT NULL,
  cp4 VARCHAR(4) NOT NULL,
  cp3 VARCHAR(3) NOT NULL,
  localidade VARCHAR(255) NOT NULL,
  num_enderecos INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (distrito_id) REFERENCES distritos(id) ON DELETE CASCADE,
  FOREIGN KEY (concelho_id) REFERENCES concelhos(id) ON DELETE CASCADE,
  INDEX idx_cp (cp4, cp3),
  INDEX idx_distrito (distrito_id),
  INDEX idx_concelho (concelho_id),
  INDEX idx_localidade (localidade)
);

CREATE TABLE IF NOT EXISTS transportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  distrito_id INT NOT NULL,
  concelho_id INT,
  tipo_transporte ENUM('metro', 'autocarro', 'comboio', 'ferry', 'outros') NOT NULL,
  cobertura_percent DECIMAL(5,2) DEFAULT 0.00,
  num_rotas INT DEFAULT 0,
  ano INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (distrito_id) REFERENCES distritos(id) ON DELETE CASCADE,
  FOREIGN KEY (concelho_id) REFERENCES concelhos(id) ON DELETE SET NULL,
  INDEX idx_distrito_ano (distrito_id, ano),
  INDEX idx_tipo (tipo_transporte),
  INDEX idx_ano (ano)
);

-- ===========================================
-- ÍNDICES ADICIONAIS
-- ===========================================
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_codigos_postais_aggregate ON codigos_postais (distrito_id, concelho_id);
CREATE INDEX idx_transportes_stats ON transportes (distrito_id, tipo_transporte, ano);