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
}

const DEFAULT_CHAIN_ID = Chain.Ethereum as LlamaChainId
const DEFAULT_BORROWED_TOKEN_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as Address
const DEFAULT_TOKEN_DECIMALS = 18
const DEFAULT_DEPOSIT = '12.5' as Decimal
const DEFAULT_PARTIAL_WITHDRAW = '2.5' as Decimal

/**
 * Old lend markets: earlier Ethereum one-way market deployments (legacy).
 * Older contract instances and can show legacy behavior in tests (for example rewards).
 */
export const OLD_LEND_SUPPLY_TEST_MARKETS: readonly SupplyRpcTestMarket[] = [
  {
    id: 'one-way-market-7',
    label: 'sUSDe-crvUSD Old Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x52096539ed1391CB50C6b9e4Fd18aFd2438ED23b' as Address,
    gaugeAddress: '0x82195f78c313540e0363736b8320a256a019f7dd' as Address,
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
  {
    id: 'one-way-market-11',
    label: 'sUSDe v2-crvUSD Old Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x4a7999c55d3a93dAf72EA112985e57c2E3b9e95D' as Address,
    gaugeAddress: '0xae1680ef5efc2486e73d8d5d0f8a8db77da5774e' as Address,
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
  {
    id: 'one-way-market-12',
    label: 'WETH-crvUSD Old Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x8fb1c7AEDcbBc1222325C39dd5c1D2d23420CAe3' as Address,
    gaugeAddress: '0xf3f6d6d412a77b680ec3a5e35ebb11bbec319739' as Address,
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
] as const

/**
 * New lend markets: later Ethereum one-way market deployments (current cohort).
 * Contract family is the same as old markets, but these are newer deployed instances
 * with newer market rollout parameters and more recent gauge integrations.
 */
export const NEW_LEND_SUPPLY_TEST_MARKETS: readonly SupplyRpcTestMarket[] = [
  {
    id: 'one-way-market-41',
    label: 'sreUSD-crvUSD New Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0xC32B0Cf36e06c790A568667A17DE80cba95A5Aad' as Address,
    gaugeAddress: '0x29e9975561fad3a7988ca96361ab5c5317cb32af' as Address,
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
  {
    id: 'one-way-market-43',
    label: 'zkBTC-crvUSD New Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x01853B37bfEaF7C1557F7996aA778A0858870c70' as Address,
    gaugeAddress: '0x169b6d105e05732ef9e0cd1d279dd81283d90aff' as Address,
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
  {
    id: 'one-way-market-44',
    label: 'UNIT0-crvUSD New Lend Market',
    chainId: DEFAULT_CHAIN_ID,
    borrowedTokenAddress: DEFAULT_BORROWED_TOKEN_ADDRESS,
    vaultAddress: '0x878fC567D55fFc9c3f4ef45296b1b129bca06fe0' as Address,
    gaugeAddress: '0x173c8b67823a4f7d80cb4d2b4ef375c2137d70cd' as Address,
    deposit: DEFAULT_DEPOSIT,
    partialWithdraw: DEFAULT_PARTIAL_WITHDRAW,
    borrowedTokenDecimals: DEFAULT_TOKEN_DECIMALS,
  },
] as const

/** Get one old and one new lend market. */
export const getSupplyRpcTestMarkets = (): readonly SupplyRpcTestMarket[] => [
  OLD_LEND_SUPPLY_TEST_MARKETS[0],
  NEW_LEND_SUPPLY_TEST_MARKETS[0],
]

export type SupplyFormType = 'deposit' | 'withdraw' | 'stake' | 'unstake'
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

export const blurSupplyInput = (type: SupplyFormType) => {
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
