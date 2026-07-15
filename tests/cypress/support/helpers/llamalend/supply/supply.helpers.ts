import type { Address } from 'viem'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, Chain } from '@ui-kit/utils'
import {
  checkEstimatedTxCost as checkEstimatedTxCostValue,
  DECIMAL_REGEX,
  getActionValue,
} from '../action-info.helpers'

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
  // gauge that exposes any claimables
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
    hasClaimableRewards: true,
  },
] as const

type SupplyFormType = 'deposit' | 'withdraw' | 'stake' | 'unstake'
export type SupplyActionType = SupplyFormType | 'claim-crv-rewards' | 'claim-other-rewards'

const getSupplyInput = (type: SupplyFormType) =>
  cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`, LOAD_TIMEOUT)

export const getSupplyInputBalanceValue = (type: SupplyFormType) =>
  cy.get(`[data-testid="supply-${type}-input"] [data-testid="balance-value"]`, LOAD_TIMEOUT)

export const getSupplyInputBalanceValueAttr = (type: SupplyFormType) =>
  getSupplyInputBalanceValue(type).invoke(LOAD_TIMEOUT, 'attr', 'data-value')

export const selectMaxSupplyInput = (type: SupplyFormType) => {
  getSupplyInputBalanceValue(type)
    .should(value => expect(Number(value.attr('data-value'))).gt(0))
    .click()
  cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`, LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .should(value => expect(Number(value)).gt(0))
  cy.get('[data-testid="supply-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
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
  cy.get(`[data-testid="supply-${type}-submit-button"]`).click(LOAD_TIMEOUT)
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
  suppliedAssets,
  prevSuppliedAssets,
  symbol,
  hasApi = true,
}: {
  supplyApy?: string
  prevSupplyApy?: string
  vaultShares?: string
  prevVaultShares?: string
  suppliedAssets?: string
  prevSuppliedAssets?: string
  symbol?: string
  hasApi?: boolean
}) => {
  cy.get('[data-testid="supply-action-info-list"]').should('be.visible')

  if (supplyApy != null) {
    getActionValue('supply-apy').should('equal', formatNumber(supplyApy as Decimal, 'percent.rate'))
  }
  if (prevSupplyApy != null) {
    getActionValue('supply-apy', 'previous').should('equal', formatNumber(prevSupplyApy as Decimal, 'percent.rate'))
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
  if (suppliedAssets != null) {
    getActionValue('supply-amount').should('equal', formatNumber(suppliedAssets as Decimal, { abbreviate: false }))
  }
  if (prevSuppliedAssets != null) {
    getActionValue('supply-amount', 'previous').should(
      'equal',
      formatNumber(prevSuppliedAssets as Decimal, { abbreviate: false }),
    )
  }
  if (symbol) {
    getActionValue('supply-amount', 'right').should('contain', symbol)
  }

  checkEstimatedTxCostValue({ hasValue: hasApi })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const checkSupplyAlert = (testId: string) => {
  cy.get(`[data-testid="${testId}"]`).should('be.visible')
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
export function checkCurrentStakedAmount({ expectedAmountSupplied }: { expectedAmountSupplied: Decimal }) {
  if (+expectedAmountSupplied) {
    getActionValue('supply-vault-shares').should('match', DECIMAL_REGEX)
    getActionValue('supply-vault-shares', 'previous').should('match', DECIMAL_REGEX)
  } else {
    getActionValue('supply-vault-shares').should('equal', '0')
    getActionValue('supply-vault-shares', 'previous').should('equal', '0')
  }

  const expectedAmount = formatNumber(expectedAmountSupplied, { abbreviate: false })
  getActionValue('supply-amount').should('equal', expectedAmount)
  getActionValue('supply-amount', 'previous').should('equal', expectedAmount)
}
