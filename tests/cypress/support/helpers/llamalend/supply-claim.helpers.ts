import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatUsd } from '@ui-kit/utils'

const submitClaimAction = () => {
  cy.get('[data-testid="supply-claim-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Claimed rewards!', TRANSACTION_LOAD_TIMEOUT)
}

export const submitClaimForm = () => submitClaimAction()

export const checkClaimTableState = ({
  rows,
  totalNotional,
  buttonDisabled,
}: {
  rows: { amount: string; symbol: string; notional?: number }[]
  totalNotional?: number
  buttonDisabled?: boolean
}) => {
  cy.get('[data-testid="supply-claim-submit-button"]').should(buttonDisabled ? 'be.disabled' : 'not.be.disabled')

  if (!rows.length) {
    cy.contains('No rewards').should('be.visible')
    cy.contains('There are currently no rewards to claim').should('be.visible')
    return
  }

  cy.get('[data-testid="data-table"]').should('exist')
  cy.get('[data-testid="data-table-cell-token"]').should('have.length', rows.length)
  cy.get('[data-testid="data-table-cell-notional"]').should('have.length', rows.length)

  rows.forEach(({ amount, symbol, notional }, index) => {
    cy.get('[data-testid="data-table-cell-token"]')
      .eq(index)
      .within(() => {
        cy.contains(formatNumber(amount as Decimal, { abbreviate: false })).should('be.visible')
        cy.contains(symbol).should('be.visible')
      })

    cy.get('[data-testid="data-table-cell-notional"]')
      .eq(index)
      .contains(notional == null ? '-' : formatUsd(notional))
  })

  if (rows.length > 1 && totalNotional != null) {
    cy.contains('Rewards value').should('be.visible')
    cy.contains(formatUsd(totalNotional)).should('be.visible')
  }
}
