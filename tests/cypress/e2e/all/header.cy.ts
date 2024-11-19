
const [minHeight, maxHeight] = [600, 1000]
const [tablet, desktop] = [640, 1200]
const [expectedMainNavHeight, expectedSubNavHeight, expectedConnectHeight] = [56, 40, 40]

export const randomInt = (min: number, maxExclusive: number): number => Math.floor(Math.random() * (maxExclusive - min)) + min

describe('Header', () => {
  describe('Desktop', () => {
    it('should have the right size', () => {
      cy.viewport(randomInt(tablet, desktop), randomInt(minHeight, maxHeight))
      cy.visit('/')
      cy.get(`header`).invoke('outerHeight').should('equal', expectedSubNavHeight + expectedMainNavHeight)
      cy.get("[data-testid='main-nav']").invoke('outerHeight').should('equal', expectedMainNavHeight)
      cy.get("[data-testid='subnav']").invoke('outerHeight').should('equal', expectedSubNavHeight)
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', expectedConnectHeight)
    })

    it('should switch themes', () => {

    })
  })

  describe('mobile', () => {
    it('should open the menu', () => {
      cy.viewport(randomInt(0, tablet), randomInt(minHeight, maxHeight))
      cy.visit('/')
      cy.get(`header`).invoke('outerHeight').should('equal', expectedMainNavHeight)
      cy.get(`[data-testid='mobile-drawer']`).should('not.be.visible')
      cy.get(`[data-testid='menu-toggle']`).click()
      cy.get(`[data-testid='mobile-drawer']`).should('be.visible')
      cy.get("[data-testid='navigation-connect-wallet']").invoke('outerHeight').should('equal', expectedConnectHeight)

      cy.url().then(url => {
        cy.get('[data-testid^="sidebar-item-"]').eq(2).click()
        cy.get(`[data-testid='mobile-drawer']`).should('not.be.visible')
        cy.url().should('not.equal', url)
      })
    })

    it('should switch themes', () => {
      // todo: test font face, theme lighting
    })
  })
})
