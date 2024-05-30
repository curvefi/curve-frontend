export function inputMaxCollateral(amount: string) {
  cy.dataTestId('inp-label-userCollateralAmt').should('contain.text', amount)
  cy.dataTestId('inp-userCollateralAmt').as('inpCollateralAmt').should('be.empty')
  cy.dataTestId('btn-userCollateralMax').click()
  cy.get('@inpCollateralAmt').should('have.value', parseInt(amount).toFixed(1))
}
