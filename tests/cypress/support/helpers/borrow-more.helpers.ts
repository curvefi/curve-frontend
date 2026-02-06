import { notFalsy } from '@curvefi/prices-api/objects.util'
import type { Decimal } from '@ui-kit/utils'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '../ui'

type BorrowMoreField = 'collateral' | 'user-borrowed' | 'debt'

const getBorrowMoreInput = (field: BorrowMoreField) =>
  cy.get(`[data-testid="borrow-more-input-${field}"] input[type="text"]`, LOAD_TIMEOUT).first()

const getActionValue = (name: string, field?: 'previous') =>
  cy.get(`[data-testid="${notFalsy(name, field, 'value').join('-')}"]`, LOAD_TIMEOUT)

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

export const checkCurrentDebt = (expectedCurrentDebt: string) => {
  getActionValue('borrow-debt').invoke(LOAD_TIMEOUT, 'text').should('equal', expectedCurrentDebt)
  getActionValue('borrow-debt', 'previous').should('not.exist')
}

export function checkBorrowMoreDetailsLoaded({
  hasLeverage,
  expectedFutureDebt,
  expectedCurrentDebt,
}: {
  expectedFutureDebt: string
  expectedCurrentDebt: string
  hasLeverage: boolean
}) {
  getActionValue('borrow-apr').contains('%')

  getActionValue('borrow-debt').invoke(LOAD_TIMEOUT, 'text').should('equal', expectedFutureDebt)
  getActionValue('borrow-debt', 'previous').invoke(LOAD_TIMEOUT, 'text').should('equal', expectedCurrentDebt)
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  if (hasLeverage) throw new Error('Leverage not supported in borrow more tests yet')
}

export function submitBorrowMoreForm() {
  cy.get('[data-testid="borrow-more-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Borrowed more!', TRANSACTION_LOAD_TIMEOUT)
}
