import testIds from '@/fixtures/testIds.json'

export function approveSpending() {
  cy.dataTestId(testIds.detailInfoEstGasValue).should('not.contain', '-')
  cy.get('@btnApproval').should('be.enabled').click()
  cy.contains('Spending Approved').should('be.visible')
  cy.get('@inpCollateralAmt').invoke('val').should('not.be.empty')
  cy.get('@inpDebtAmt').invoke('val').should('not.be.empty')
}

export function approveLeverageSpending() {
  cy.wait('@getPricesAPI').its('response.statusCode').should('equal', 200)
  cy.dataTestId(testIds.detailInfoEstGasValue).should('not.contain', '-')

  cy.dataTestId(testIds.btnApproval).should('be.enabled').click()
  cy.contains('Spending Approved').should('be.visible')
  cy.get('@inpCollateralAmt').invoke('val').should('not.be.empty')
  cy.get('@inpDebtAmt').invoke('val').should('not.be.empty')
}
