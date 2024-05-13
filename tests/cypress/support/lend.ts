export function createSofLiquidationLoan() {
  cy.get('@btnCreate').should('be.enabled').click()
  cy.dataTestId('modal-warning').as('modalWarning').should('be.visible')
  cy.dataTestId('btn-createAnyway').as('btnCreateAnyway').should('be.disabled')

  cy.get('@modalWarning').find('[type="checkbox"]').not('[disabled]').check({ force: true }).should('be.checked')
  cy.get('@btnCreateAnyway').should('be.enabled').click()
  cy.contains('Loan Received').should('be.visible')
}
