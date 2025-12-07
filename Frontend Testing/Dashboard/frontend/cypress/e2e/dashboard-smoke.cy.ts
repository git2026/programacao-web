/// <reference types="cypress" />
// Teste de smoke E2E do dashboard com chamadas de API falsas

interface DashboardFixture {
  overview: any;
  distritos: any[];
  timeline: any[];
  distribution: any[];
  coverage: any[];
  filters: any;
}

describe('Dashboard - smoke E2E', () => {
  beforeEach(() => {
    cy.fixture<DashboardFixture>('dashboard.json').then((data) => {
      cy.intercept('GET', '**/api/dashboard/stats/resumo', {
        success: true,
        data: data.overview
      }).as('overview');

      cy.intercept('GET', '**/api/dashboard/stats/por-distrito*', {
        success: true,
        data: data.distritos
      }).as('districts');

      cy.intercept('GET', '**/api/dashboard/stats/evolucao-transportes*', {
        success: true,
        data: data.timeline
      }).as('timeline');

      cy.intercept('GET', '**/api/dashboard/stats/distribuicao-transportes*', {
        success: true,
        data: data.distribution
      }).as('distribution');

      cy.intercept('GET', '**/api/dashboard/stats/cobertura-transportes*', {
        success: true,
        data: data.coverage
      }).as('coverage');

      cy.intercept('GET', '**/api/dashboard/filtros', {
        success: true,
        data: data.filters
      }).as('filters');
    });

    cy.visit('/', {
      onBeforeLoad: (win: Window) => {
        win.localStorage.setItem('theme', 'dark');
      }
    });
  });

  it('carrega KPIs com dados falsos', () => {
    cy.wait(['@overview', '@districts', '@timeline', '@distribution', '@coverage', '@filters']);
    cy.contains('h3', 'Total de Distritos')
      .parents('[class*=kpiCard]')
      .within(() => cy.get('[class*=value]').should('contain', '2'));

    cy.contains('h3', 'Total de Concelhos')
      .parents('[class*=kpiCard]')
      .within(() => cy.get('[class*=value]').should('contain', '3'));

    cy.contains('h3', 'Códigos Postais')
      .parents('[class*=kpiCard]')
      .within(() => cy.get('[class*=value]').should('contain', '120'));
  });

  it('permite alternar tema pelo botão do cabeçalho', () => {
    cy.get('button[aria-label="Alternar tema de cor"]').as('toggle');
    cy.get('@toggle').should('contain', '🌙');
    cy.get('@toggle').click();
    cy.get('@toggle').should('contain', '☀️');
    cy.get('html').should('have.attr', 'data-theme', 'light');
  });

  it('aplica filtro de distrito', () => {
    cy.wait('@filters');
    cy.get('#filter-distrito').select('Lisboa');
    cy.wait('@districts');
    cy.contains('Top 10 Distritos').should('exist');
  });
});