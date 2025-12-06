/**Rotas de Importação de Dados CSV
 * Todas as rotas requerem autenticação:
 * - admin/editor: podem importar dados
 * - admin: pode limpar todas as tabelas (ação irreversível)
 */

import express from 'express';
import * as importController from '../controllers/importController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Importar distritos
router.post(
  '/distritos',
  authMiddleware,
  roleMiddleware(['admin', 'editor']),
  importController.handleImportDistritos
);

// Importar concelhos
router.post(
  '/concelhos',
  authMiddleware,
  roleMiddleware(['admin', 'editor']),
  importController.handleImportConcelhos
);

// Importar códigos postais
router.post(
  '/codigos-postais',
  authMiddleware,
  roleMiddleware(['admin', 'editor']),
  importController.handleImportCodigosPostais
);

// Importar transportes
router.post(
  '/transportes',
  authMiddleware,
  roleMiddleware(['admin', 'editor']),
  importController.handleImportTransportes
);

// Importar tudo de uma vez
router.post(
  '/tudo',
  authMiddleware,
  roleMiddleware(['admin', 'editor']),
  importController.handleImportAll
);

// Limpar todas as tabelas
router.delete(
  '/limpar-tabelas',
  authMiddleware,
  roleMiddleware(['admin']),
  importController.handleClearTables
);

export default router;