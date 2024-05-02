export function inputMaxCollateral(amount: string) {
  cy.dataTestId('inp-label-description-collateralAmt').should('have.text', amount)
  cy.dataTestId('inp-collateralAmt').as('inpCollateralAmt').should('be.empty')
  cy.dataTestId('btn-collateralMax').click()
  cy.get('@inpCollateralAmt').should('have.value', parseInt(amount).toFixed(1))
}
