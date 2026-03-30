import BigNumber from 'bignumber.js'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatUsd } from '@ui-kit/utils'
import { getActionValue } from '../action-info.helpers'
import { submitSupplyForm } from './supply.helpers'

const CLAIMABLE_AMOUNT_REGEX = /(\d[\d,]*(?:\.\d+)?)/

export const submitClaimForm = () => submitSupplyForm('claim', 'Claimed rewards!')

/**
 * The claim tab has no editable inputs, so "touching" it means waiting for the
 * post-claim refetch to settle into the empty state.
 */
export const touchClaimForm = () => {
  cy.get('[data-testid="supply-claim-submit-button"]', LOAD_TIMEOUT).should('be.disabled')
}

/**
 * Check all claim detail values are loaded and valid.
 */
export function checkClaimDetailsLoaded({
  hasRewards = true,
  expectedSymbols,
  checkEstimatedTxCost = hasRewards,
}: {
  hasRewards?: boolean
  expectedSymbols?: string[]
  checkEstimatedTxCost?: boolean
} = {}) {
  cy.get('[data-testid="supply-claim-submit-button"]', LOAD_TIMEOUT).should(
    hasRewards ? 'not.be.disabled' : 'be.disabled',
  )
  cy.get('[data-testid="claim-action-info-list"]').should('be.visible')

  if (checkEstimatedTxCost) {
    getActionValue('estimated-tx-cost').should('include', '$')
  }
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')

  if (!hasRewards) {
    cy.contains('No rewards').should('be.visible')
    cy.contains('There are currently no rewards to claim').should('be.visible')
    return
  }

  cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('exist')
  cy.get('[data-testid="data-table-cell-token"]', LOAD_TIMEOUT).should(($rows) => {
    expect($rows.length).to.be.greaterThan(0)
  })
  cy.get('[data-testid="data-table-cell-token"]').each(($row) => {
    const match = $row.text().replaceAll(',', '').match(CLAIMABLE_AMOUNT_REGEX)
    expect(match?.[1]).to.not.equal(undefined)
    expect(new BigNumber(match![1]).gt(0)).to.equal(true)
  })
  cy.get('[data-testid="data-table-cell-notional"]').should(($rows) => {
    expect($rows.length).to.be.greaterThan(0)
  })
  cy.get('[data-testid="data-table-cell-token"]').then(($rows) => {
    if ($rows.length > 1) cy.contains('Rewards value').should('be.visible')
  })

  expectedSymbols?.forEach((symbol) => {
    cy.get('[data-testid="data-table-cell-token"]').contains(symbol)
  })
}

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
