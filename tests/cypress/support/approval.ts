import { TEST_IDS } from '@/support/helpers/constants'

export function approveSpending() {
  cy.dataTestId(TEST_IDS.detailInfoEstGasValue).should('not.contain', '-')
  cy.get('@btnApproval').should('be.enabled').click()
  cy.contains('Spending Approved').should('be.visible')
  cy.get('@inpCollateralAmt').invoke('val').should('not.be.empty')
  cy.get('@inpDebtAmt').invoke('val').should('not.be.empty')
}

export function approveLeverageSpending() {
  cy.wait('@getPricesAPI').its('response.statusCode').should('equal', 200)
  cy.dataTestId(TEST_IDS.detailInfoEstGasValue).should('not.contain', '-')

  cy.get('@btnApproval').should('be.enabled').click()
  cy.contains('Spending Approved').should('be.visible')
  cy.get('@inpCollateralAmt').invoke('val').should('not.be.empty')
  cy.get('@inpDebtAmt').invoke('val').should('not.be.empty')
}
