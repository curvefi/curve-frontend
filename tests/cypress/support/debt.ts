import { TEST_IDS } from '@/support/helpers/constants'

export function inputMaxBorrow() {
  cy.contains('span', 'Max borrow amount')
    .invoke('text')
    .should('match', /Max borrow amount \d+(\.\d+)?/)
  cy.dataTestId('inp-debtAmt').as('inpDebtAmt').should('be.empty')
  cy.dataTestId('btn-debtMax').click()
  cy.get('@inpDebtAmt').invoke('val').as('debtAmount', { type: 'static' }).should('not.be.empty')
  cy.contains('close to soft liquidation').should('be.visible')
}

export function inputBorrow(amount: string) {
  const regex = /Max borrow amount [\d,.]+$/
  cy.dataTestId(TEST_IDS.labelMaxBorrowAmt).contains(regex)
  cy.dataTestId(TEST_IDS.inpDebtAmt).as('inpDebtAmt').should('be.empty')
  cy.get('@inpDebtAmt').type(amount)
  cy.get('@inpDebtAmt').invoke('val').should('not.be.empty')
}
