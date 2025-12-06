-- ===========================================
-- SCRIPT PARA LIMPAR TODAS AS TABELAS DA BD
-- ===========================================

USE dashboard;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transportes;
TRUNCATE TABLE codigos_postais;
TRUNCATE TABLE concelhos;
TRUNCATE TABLE distritos;

SET FOREIGN_KEY_CHECKS = 1;
ALTER TABLE transportes AUTO_INCREMENT = 1;
ALTER TABLE codigos_postais AUTO_INCREMENT = 1;
ALTER TABLE concelhos AUTO_INCREMENT = 1;
ALTER TABLE distritos AUTO_INCREMENT = 1;

SELECT 'transportes' as tabela, COUNT(*) as registos FROM transportes
UNION ALL
SELECT 'codigos_postais', COUNT(*) FROM codigos_postais
UNION ALL
SELECT 'concelhos', COUNT(*) FROM concelhos
UNION ALL
SELECT 'distritos', COUNT(*) FROM distritos;