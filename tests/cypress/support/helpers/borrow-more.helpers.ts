import type { Decimal } from '@ui-kit/utils'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '../ui'
import { checkDebt, getActionValue } from './llamalend/action-info.helpers'

type BorrowMoreField = 'collateral' | 'user-borrowed' | 'debt'

const getBorrowMoreInput = (field: BorrowMoreField) =>
  cy.get(`[data-testid="borrow-more-input-${field}"] input[type="text"]`, LOAD_TIMEOUT).first()

const writeOptionalBorrowMoreInput = (field: BorrowMoreField, value: Decimal | undefined) => {
  if (value == null) return
  cy.get('body').then((body) => {
    const selector = `[data-testid="borrow-more-input-${field}"] input[type="text"]`
    if (body.find(selector).length) {
      cy.get(selector, LOAD_TIMEOUT).first().as('borrowMoreInput')
      cy.get('@borrowMoreInput').clear()
      cy.get('@borrowMoreInput').type(value)
    }
  })
}

export function writeBorrowMoreForm({
  debt,
  userCollateral,
  userBorrowed,
  openAccordion = true,
}: {
  debt: Decimal
  userCollateral?: Decimal
  userBorrowed?: Decimal
  openAccordion?: boolean
}) {
  writeOptionalBorrowMoreInput('collateral', userCollateral)
  writeOptionalBorrowMoreInput('user-borrowed', userBorrowed)
  getBorrowMoreInput('debt').as('borrowMoreDebt')
  cy.get('@borrowMoreDebt').clear()
  cy.get('@borrowMoreDebt').type(debt)
  if (openAccordion) cy.get('[data-testid="loan-info-accordion"] button', LOAD_TIMEOUT).first().click()
}

export function checkBorrowMoreDetailsLoaded({
  leverageEnabled,
  expectedFutureDebt,
  expectedCurrentDebt,
}: {
  expectedFutureDebt: Decimal
  expectedCurrentDebt: Decimal
  leverageEnabled: boolean
}) {
  getActionValue('borrow-apr').should('include', '%')
  checkDebt(expectedCurrentDebt, expectedFutureDebt, 'crvUSD')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  if (leverageEnabled) throw new Error('Leverage not supported in borrow more tests yet')
}

export function submitBorrowMoreForm() {
  cy.get('[data-testid="borrow-more-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Borrowed more!', TRANSACTION_LOAD_TIMEOUT)
}
