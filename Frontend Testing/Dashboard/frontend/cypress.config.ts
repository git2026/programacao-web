import { defineConfig } from 'cypress';

// Configuração base do Cypress para testes E2E do frontend
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts'
  }
});