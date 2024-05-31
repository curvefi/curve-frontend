export function createSofLiquidationLoan() {
  cy.get('@btnCreate').should('be.enabled').click()
  cy.dataTestId('modal-warning').as('modalWarning').should('be.visible')
  cy.dataTestId('btn-createAnyway').as('btnCreateAnyway').should('be.disabled')

  cy.get('@modalWarning').find('[type="checkbox"]').not('[disabled]').check({ force: true }).should('be.checked')
  cy.get('@btnCreateAnyway').should('be.enabled').click()
  cy.contains('Loan Received').should('be.visible')
}

export function createLeverageLoan() {
  cy.dataTestId('detailInfoValue-estGas').should('not.contain', '-')

  cy.get('@btnCreate').should('be.enabled').click()

  cy.dataTestId('detailInfoLabel-priceImpact').then(($el) => {
    const text = $el.text()
    if (text.startsWith('High')) {
      cy.dataTestId('checkbox-confirmProceed').click({ force: true })
      cy.dataTestId('btn-createAnyway').as('createAnyway').should('not.be.disabled')
      cy.get('@createAnyway').click()
    }
  })

  cy.contains('Loan Received').should('be.visible')
  cy.dataTestId('link-manageLoan').should('be.visible')
}
