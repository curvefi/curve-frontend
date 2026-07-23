export const enableBeta = (isMobile: boolean) => {
  if (isMobile) {
    cy.get('[data-testid="menu-toggle"]').click()
    cy.get('[data-testid="mobile-drawer"]').should('be.visible')
    cy.get('[data-testid="sidebar-settings"]').scrollIntoView().click()
  } else {
    cy.get('[data-testid="user-profile-button"]').click()
  }

  cy.get('[data-testid="user-profile-settings"]').should('be.visible')
  cy.get('[data-testid="release-channel-button-Beta"]')
    .should('be.visible')
    .then($button => {
      if ($button.attr('aria-pressed') !== 'true') {
        cy.wrap($button).click()
        cy.contains('button', 'Enable Beta Features').should('be.visible').click()
      }
    })
  cy.get('[data-testid="release-channel-button-Beta"]').should('have.attr', 'aria-pressed', 'true')

  if (isMobile) {
    cy.get('[data-testid="menu-toggle"]').click()
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
  } else {
    cy.get('body').type('{esc}')
    cy.get('[data-testid="user-profile-settings"]').should('not.exist')
  }
}
