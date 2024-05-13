export function inputMaxBorrow() {
  cy.contains('span', 'Max borrow amount')
    .invoke('text')
    .should('match', /Max borrow amount \d+(\.\d+)?/)
  cy.dataTestId('inp-debtAmt').as('inpDebtAmt').should('be.empty')
  cy.dataTestId('btn-debtMax').click()
  cy.get('@inpDebtAmt').invoke('val').as('debtAmount', { type: 'static' }).should('not.be.empty')
  cy.contains('close to soft liquidation').should('be.visible')
}
