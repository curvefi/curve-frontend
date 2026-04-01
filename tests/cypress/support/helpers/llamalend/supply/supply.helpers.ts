import type { Address } from 'viem'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatPercent } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils'
import { getActionValue } from '../action-info.helpers'

type SupplyRpcTestMarket = {
  id: string
  label: string
  chainId: LlamaChainId
  borrowedTokenAddress: Address
  vaultAddress: Address
  gaugeAddress: Address
  deposit: Decimal
  partialWithdraw: Decimal
  borrowedTokenDecimals: number
  // Some gauges do not expose any claimables, so we skip the "claim" call
  hasClaimableRewards?: boolean
}

const DEFAULT_CHAIN_ID = Chain.Ethereum
const DEFAULT_BORROWED_TOKEN_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'
const DEFAULT_TOKEN_DECIMALS = 18
const DEFAULT_DEPOSIT = '12.5'
const DEFAULT_PARTIAL_WITHDRAW = '2.5'

export const SUPPLY_TEST_MARKETS: readonly SupplyRpcTestMarket[] = [
  {
    id: 'one-way-market-11',
    label: 'sUSDe v2-crvUSD Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x4a7999c55d3a93dAf72EA112985e57c2E3b9e95D',
    gaugeAddress: '0xae1680ef5efc2486e73d8d5d0f8a8db77da5774e',
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
    hasClaimableRewards: false,
  },
  {
    id: 'one-way-market-12',
    label: 'WETH-crvUSD Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x8fb1c7AEDcbBc1222325C39dd5c1D2d23420CAe3',
    gaugeAddress: '0xf3f6d6d412a77b680ec3a5e35ebb11bbec319739',
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
    hasClaimableRewards: false,
  },
  {
    id: 'one-way-market-41',
    label: 'sreUSD-crvUSD Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0xC32B0Cf36e06c790A568667A17DE80cba95A5Aad',
    gaugeAddress: '0x29e9975561fad3a7988ca96361ab5c5317cb32af',
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
] as const

type SupplyFormType = 'deposit' | 'withdraw' | 'stake' | 'unstake'
type SupplyActionType = SupplyFormType | 'claim'

const getSupplyInput = (type: SupplyFormType) =>
  cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`, LOAD_TIMEOUT)

export const getSupplyInputBalanceValue = (type: SupplyFormType) =>
  cy.get(`[data-testid="supply-${type}-input"] [data-testid="balance-value"]`, LOAD_TIMEOUT)

export const getSupplyInputBalanceValueAttr = (type: SupplyFormType) =>
  getSupplyInputBalanceValue(type).invoke(LOAD_TIMEOUT, 'attr', 'data-value')

export const writeSupplyInput = ({ type, amount }: { type: SupplyFormType; amount: Decimal | string }) => {
  getSupplyInput(type).clear()
  getSupplyInput(type).type(amount)
  blurSupplyInput(type)
}

const blurSupplyInput = (type: SupplyFormType) => {
  getSupplyInput(type).blur()
  cy.get('[data-testid="supply-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
}

export const touchSupplyInput = (type: SupplyFormType) => {
  getSupplyInput(type).should('have.value', '')
  getSupplyInput(type).type('0')
  blurSupplyInput(type)
}

export const submitSupplyForm = (type: SupplyActionType, successMessage: string) => {
  cy.get(`[data-testid="supply-${type}-submit-button"]`, LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains(successMessage, TRANSACTION_LOAD_TIMEOUT)
}

export const checkSupplySubmitButtonText = (type: SupplyFormType, buttonText: string) =>
  cy.get(`[data-testid="supply-${type}-submit-button"]`, LOAD_TIMEOUT).should('have.text', buttonText)

export const checkSupplyActionInfoValues = ({
  supplyApy,
  prevSupplyApy,
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  symbol,
  checkEstimatedTxCost = true,
}: {
  supplyApy?: string
  prevSupplyApy?: string
  vaultShares?: string
  prevVaultShares?: string
  amountSupplied?: string
  prevAmountSupplied?: string
  symbol?: string
  checkEstimatedTxCost?: boolean
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

  if (checkEstimatedTxCost) {
    getActionValue('estimated-tx-cost').should('include', '$')
  }
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

/**
 * Check the current supplied amount after a supply action.
 */
export function checkCurrentSuppliedAmount(expectedAmount: Decimal) {
  const expected = formatNumber(expectedAmount, { abbreviate: false })
  getActionValue('supply-amount').should('equal', expected)
  getActionValue('supply-amount', 'previous').should('equal', expected)
}

/**
 * Check the current staked vault shares and supplied amount after a stake/unstake action.
 */
export function checkCurrentStakedAmount({
  expectedVaultShares,
  expectedAmountSupplied,
}: {
  expectedVaultShares: Decimal
  expectedAmountSupplied: Decimal
}) {
  const expectedShares = formatNumber(expectedVaultShares, { abbreviate: true })
  const expectedAmount = formatNumber(expectedAmountSupplied, { abbreviate: false })

  getActionValue('supply-vault-shares').should('equal', expectedShares)
  getActionValue('supply-vault-shares', 'previous').should('equal', expectedShares)
  getActionValue('supply-amount').should('equal', expectedAmount)
  getActionValue('supply-amount', 'previous').should('equal', expectedAmount)
}
