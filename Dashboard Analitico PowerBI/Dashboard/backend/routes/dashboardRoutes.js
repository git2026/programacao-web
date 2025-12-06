/* Rotas do Dashboard Analítico */

import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// KPIs e Resumo
router.get('/stats/resumo', dashboardController.getOverviewStats);

// Estatísticas por Distrito
router.get('/stats/por-distrito', dashboardController.getStatsByDistrict);
router.get('/stats/densidade-distrito', dashboardController.getDistrictDensity);

// Estatísticas por Concelho
router.get('/stats/por-concelho', dashboardController.getStatsByCounty);

// Estatísticas de Transportes
router.get('/stats/cobertura-transportes', dashboardController.getTransportCoverage);
router.get('/stats/evolucao-transportes', dashboardController.getTransportTimeline);
router.get('/stats/distribuicao-transportes', dashboardController.getTransportDistribution);

// Filtros e Listas
router.get('/filtros', dashboardController.getFilterOptions);
router.get('/distritos', dashboardController.getAllDistricts);
router.get('/concelhos', dashboardController.getAllCounties);
router.get('/transportes', dashboardController.getAllTransports);

// Pesquisa
router.get('/codigos-postais/pesquisar', dashboardController.searchPostalCodes);

export default router;