export function approveSpending() {
  cy.get('@btnApproval').should('be.enabled').click()
  cy.contains('Spending Approved').should('be.visible')
  cy.get('@inpCollateralAmt').should('be.disabled').invoke('val').should('not.be.empty')
  cy.get('@inpDebtAmt').should('be.disabled').invoke('val').should('not.be.empty')
}
