
const [minHeight, maxHeight] = [600, 1000];
const [tablet, desktop] = [640, 1200];

export const randomInt = (min: number, maxExclusive: number): number => Math.floor(Math.random() * (maxExclusive - min)) + min

describe('Header', () => {
  describe('Desktop', () => {
    it('should have the right size', () => {
      cy.viewport(randomInt(tablet, desktop), randomInt(minHeight, maxHeight));
      cy.visit('/')
      cy.get(`header`).invoke('outerHeight').should('equal', 96);
      cy.get("[data-testid='main-nav']").invoke('outerHeight').should('equal', 56);
      cy.get("[data-testid='subnav']").invoke('outerHeight').should('equal', 40);
    })
  })
})
