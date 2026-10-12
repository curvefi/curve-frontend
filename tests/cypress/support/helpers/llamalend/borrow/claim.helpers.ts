import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { checkEstimatedTxCost } from '../action-info.helpers'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from '../mock-loan-test-data'
import { createMockLendMarket } from '../mock-market.helpers'
import { checkClaimTableState } from '../supply/claim.helpers'
import { createStub, createTransactionStub } from '../test-stub.utils'

const getBorrowClaimSubmitButton = () =>
  cy.get('[data-testid="borrow-claim-crv-rewards-submit-button"]', TIMEOUTS['mock.evm.contractRead'])

export const createBorrowClaimScenario = ({ chainId, claimableCrv }: { chainId: number; claimableCrv: Decimal }) => {
  const claimableCrvStub = createStub(claimableCrv)
  const estimateGasClaimCrv = createStub(77_000)
  const claimCrv = createTransactionStub(TEST_TX_HASH)
  const collateralRewards = {
    claimableCrv: claimableCrvStub,
    estimateGas: { claimCrv: estimateGasClaimCrv },
    claimCrv,
  } satisfies Pick<LendMarketTemplate['collateralRewards'], 'claimableCrv' | 'estimateGas' | 'claimCrv'>
  const market = createMockLendMarket({ version: 'v2', collateralRewards })
  const shouldClaimCrv = Number(claimableCrv) > 0

  return {
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      shouldClaimCrv,
      crvButtonDisabled: !shouldClaimCrv,
      table: {
        rows: notFalsy(shouldClaimCrv && { amount: claimableCrv, symbol: 'CRV', notional: Number(claimableCrv) }),
        totalNotional: shouldClaimCrv ? Number(claimableCrv) : undefined,
      },
    },
    assertPreSubmit: () => {
      expect(claimableCrvStub).to.have.been.calledWithExactly(TEST_ADDRESS)
      if (shouldClaimCrv) {
        expect(estimateGasClaimCrv).to.have.been.calledWithExactly()
      }
    },
    assertSubmit: () => {
      expect(claimCrv).to.have.been.calledWithExactly()
    },
  }
}

export function validateBorrowClaimFormState({ crvButtonDisabled }: { crvButtonDisabled: boolean }) {
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('[data-testid="loan-alert-error"]').should('not.exist')
  cy.get('[data-testid="borrow-claim-empty-state"]', TIMEOUTS['mock.evm.contractRead']).should(
    crvButtonDisabled ? 'be.visible' : 'not.exist',
  )
}

export function checkBorrowClaimTableState({ rows, totalNotional }: Parameters<typeof checkClaimTableState>[0]) {
  if (!rows.length) {
    cy.get('[data-testid="data-table-cell-token"]').should('not.exist')
    cy.get('[data-testid="data-table-cell-notional"]').should('not.exist')
    cy.get('[data-testid="rewards-value"]').should('not.exist')
    return
  }

  checkClaimTableState({ rows, totalNotional })
  cy.get('[data-testid="rewards-value"]', TIMEOUTS['mock.evm.contractRead'])
    .should('be.visible')
    .closest('tr')
    .find('td')
    .eq(1)
    .contains(formatNumber(totalNotional, 'usd.notional'))
    .should('be.visible')
}

export function checkBorrowClaimDetailsLoaded({ hasCrvRewards }: { hasCrvRewards: boolean }) {
  cy.get('[data-testid="borrow-claim-action-info-list"]', TIMEOUTS['mock.evm.contractRead']).should(
    hasCrvRewards ? 'be.visible' : 'not.be.visible',
  )
  getBorrowClaimSubmitButton().should(hasCrvRewards ? 'not.be.disabled' : 'be.disabled')
  if (!hasCrvRewards) return

  checkEstimatedTxCost({ name: 'borrow-claim-crv-rewards-estimated-tx-cost', category: 'mock.evm.simulation' })
  cy.get('[data-testid="data-table"]', TIMEOUTS['mock.evm.contractRead']).should('exist')
}

export const submitBorrowClaim = () => {
  getBorrowClaimSubmitButton().click(TIMEOUTS['ui.interaction'])
  cy.get('[data-testid="toast-success"]', TIMEOUTS['mock.evm.confirmation']).contains(
    'Claimed rewards!',
    TIMEOUTS['mock.evm.confirmation'],
  )
  return cy.get('[data-testid="loan-alert-error"]').should('not.exist')
}
