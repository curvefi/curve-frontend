export function approveSpending() {
  cy.get('@btnApproval').should('be.enabled').click()
  cy.contains('Spending Approved').should('be.visible')
  cy.get('@inpCollateralAmt').invoke('val').should('not.be.empty')
  cy.get('@inpDebtAmt').invoke('val').should('not.be.empty')
}
