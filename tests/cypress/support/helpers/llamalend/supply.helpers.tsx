import { type ReactElement } from 'react'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'
import { createMockLlamaApi } from './mock-loan-test-data'
import { MockLoanTestWrapper } from './MockLoanTestWrapper'
import { setGasInfo, setLlamaApi } from './test-context.helpers'

export type SupplyFormType = 'deposit' | 'withdraw' | 'stake' | 'unstake'
export type SupplyActionType = SupplyFormType | 'claim'

const getSupplyInput = (type: SupplyFormType) => cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`)

export const mountSupplyComponent = <ChainId extends LlamaChainId>({
  chainId,
  networks,
  llamaApi,
  children,
}: {
  chainId: ChainId
  networks: NetworkDict<ChainId>
  llamaApi: ReturnType<typeof createMockLlamaApi>
  children: ReactElement
}) => {
  setLlamaApi(llamaApi)
  setGasInfo({ chainId, networks })
  cy.mount(<MockLoanTestWrapper llamaApi={llamaApi}>{children}</MockLoanTestWrapper>)
}

export const writeSupplyInput = ({ type, amount }: { type: SupplyFormType; amount: Decimal | string }) => {
  getSupplyInput(type).clear()
  getSupplyInput(type).type(amount)
}

export const blurSupplyInput = (type: SupplyFormType) => {
  getSupplyInput(type).blur()
  cy.get('[data-testid="supply-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
}

export const submitSupplyAction = (type: SupplyActionType) =>
  cy.get(`[data-testid="supply-${type}-submit-button"]`, LOAD_TIMEOUT).click()

export const checkSupplyActionInfoValues = ({
  supplyApy,
  prevSupplyApy,
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  symbol,
}: {
  supplyApy?: string
  prevSupplyApy?: string
  vaultShares?: string
  prevVaultShares?: string
  amountSupplied?: string
  prevAmountSupplied?: string
  symbol?: string
}) => {
  cy.get('[data-testid="supply-action-info-list"]').should('be.visible')

  if (supplyApy != null) {
    getActionValue('supply-apy').should('equal', formatPercent(supplyApy as Decimal))
  }
  if (prevSupplyApy != null) {
    getActionValue('supply-apy', 'previous').should('equal', formatPercent(prevSupplyApy as Decimal))
  }
  if (vaultShares != null) {
    getActionValue('supply-vault-shares').should('equal', formatNumber(vaultShares as Decimal, { abbreviate: true }))
  }
  if (prevVaultShares != null) {
    getActionValue('supply-vault-shares', 'previous').should(
      'equal',
      formatNumber(prevVaultShares as Decimal, { abbreviate: true }),
    )
  }
  if (amountSupplied != null) {
    getActionValue('supply-amount').should('equal', formatNumber(amountSupplied as Decimal, { abbreviate: false }))
  }
  if (prevAmountSupplied != null) {
    getActionValue('supply-amount', 'previous').should(
      'equal',
      formatNumber(prevAmountSupplied as Decimal, { abbreviate: false }),
    )
  }
  if (symbol) {
    cy.get('[data-testid="supply-amount-value"]').contains(symbol)
  }

  getActionValue('estimated-tx-cost').should('include', '$')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const checkSupplyAlert = ({
  title,
  description,
  testId,
}: {
  title: string
  description?: string
  testId?: string
}) => {
  const alert = testId
    ? cy.get(`[data-testid="${testId}"]`)
    : cy.contains('.MuiAlert-root', title).closest('.MuiAlert-root')
  alert.should('be.visible').within(() => {
    cy.contains(title)
    if (description) cy.contains(description)
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
