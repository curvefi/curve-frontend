import type { Address } from 'viem'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import { formatNumber } from '@primitives/number.utils'
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
    hasClaimableRewards: true,
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
    hasClaimableRewards: true,
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
  cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`, TIMEOUTS['ui.render'])

const getSupplyInputBalanceValue = (type: SupplyFormType, isMocked = false) =>
  cy.get(
    `[data-testid="supply-${type}-input"] [data-testid="balance-value"]`,
    TIMEOUTS[getTimeoutCategory('evm.balances', isMocked)],
  )

export const getSupplyInputBalanceValueAttr = (type: SupplyFormType, isMocked = false) =>
  getSupplyInputBalanceValue(type, isMocked).invoke(
    TIMEOUTS[getTimeoutCategory('evm.balances', isMocked)],
    'attr',
    'data-value',
  )

export const selectMaxSupplyInput = (type: SupplyFormType, isMocked = false) => {
  getSupplyInputBalanceValue(type, isMocked)
    .should(value => expect(Number(value.attr('data-value'))).gt(0))
    .click()
  cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`, TIMEOUTS['ui.render'])
    .invoke(TIMEOUTS['ui.render'], 'attr', 'data-value')
    .should(value => expect(Number(value)).gt(0))
  cy.get('[data-testid="supply-action-info-list"]', TIMEOUTS['ui.render']).should('be.visible')
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
export const writeSupplyInput = ({ type, amount }: { type: SupplyFormType; amount: Decimal | string }) => {
  getSupplyInput(type).clear()
  getSupplyInput(type).type(amount)
  blurSupplyInput(type)
}

const blurSupplyInput = (type: SupplyFormType) => {
  getSupplyInput(type).blur()
  cy.get('[data-testid="supply-action-info-list"]', TIMEOUTS['ui.render']).should('be.visible')
}

export const touchSupplyInput = (type: SupplyFormType) => {
  getSupplyInput(type).should('have.value', '')
  getSupplyInput(type).type('0')
  blurSupplyInput(type)
}

export const submitSupplyForm = (type: SupplyActionType, successMessage: string, isMocked = false) => {
  cy.get(`[data-testid="supply-${type}-submit-button"]`).click(TIMEOUTS['ui.interaction'])
  return cy
    .get('[data-testid="toast-success"]', TIMEOUTS[getTimeoutCategory('evm.confirmation', isMocked)])
    .contains(successMessage, TIMEOUTS[getTimeoutCategory('evm.confirmation', isMocked)])
}

export const checkSupplySubmitButtonText = (type: SupplyFormType, buttonText: string, isMocked = false) =>
  cy
    .get(`[data-testid="supply-${type}-submit-button"]`, TIMEOUTS[getTimeoutCategory('evm.allowance', isMocked)])
    .should('have.text', buttonText)

export const checkSupplyActionInfoValues = ({
  supplyApy,
  prevSupplyApy,
  vaultShares,
  prevVaultShares,
  suppliedAssets,
  prevSuppliedAssets,
  symbol,
  hasApi = true,
  isMocked = false,
}: {
  supplyApy?: string
  prevSupplyApy?: string
  vaultShares?: string
  prevVaultShares?: string
  suppliedAssets?: string
  prevSuppliedAssets?: string
  symbol?: string
  hasApi?: boolean
  isMocked?: boolean
}) => {
  cy.get('[data-testid="supply-action-info-list"]').should('be.visible')

  if (supplyApy != null) {
    getActionValue('supply-apy', getTimeoutCategory('evm.simulation', isMocked)).should(
      'equal',
      formatNumber(supplyApy as Decimal, 'percent.rate'),
    )
  }
  if (prevSupplyApy != null) {
    getActionValue('supply-apy', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
      'equal',
      formatNumber(prevSupplyApy as Decimal, 'percent.rate'),
    )
  }
  if (vaultShares != null) {
    getActionValue('supply-vault-shares', getTimeoutCategory('evm.simulation', isMocked)).should(
      'equal',
      formatNumber(vaultShares as Decimal, { abbreviate: true }),
    )
  }
  if (prevVaultShares != null) {
    getActionValue('supply-vault-shares', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
      'equal',
      formatNumber(prevVaultShares as Decimal, { abbreviate: true }),
    )
  }
  if (suppliedAssets != null) {
    getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked)).should(
      'equal',
      formatNumber(suppliedAssets as Decimal, { abbreviate: false }),
    )
  }
  if (prevSuppliedAssets != null) {
    getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
      'equal',
      formatNumber(prevSuppliedAssets as Decimal, { abbreviate: false }),
    )
  }
  if (symbol) {
    getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked), 'right').should('contain', symbol)
  }

  checkEstimatedTxCostValue({ hasValue: hasApi, category: getTimeoutCategory('evm.simulation', isMocked) })
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const checkSupplyAlert = (testId: string) => {
  cy.get(`[data-testid="${testId}"]`).should('be.visible')
}

/**
 * Check the current supplied amount after a supply action.
 */
export function checkCurrentSuppliedAmount(expectedAmount: Decimal, isMocked = false) {
  const expected = formatNumber(expectedAmount, 'token.amount')
  getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked)).should('equal', expected)
  getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked), 'previous').should('equal', expected)
}

/**
 * Check the current staked vault shares and supplied amount after a stake/unstake action.
 */
export function checkCurrentStakedAmount({
  expectedAmountSupplied,
  isMocked = false,
}: {
  expectedAmountSupplied: Decimal
  isMocked?: boolean
}) {
  if (+expectedAmountSupplied) {
    getActionValue('supply-vault-shares', getTimeoutCategory('evm.simulation', isMocked)).should('match', DECIMAL_REGEX)
    getActionValue('supply-vault-shares', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
      'match',
      DECIMAL_REGEX,
    )
  } else {
    getActionValue('supply-vault-shares', getTimeoutCategory('evm.simulation', isMocked)).should('equal', '0')
    getActionValue('supply-vault-shares', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
      'equal',
      '0',
    )
  }

  const expectedAmount = formatNumber(expectedAmountSupplied, 'token.amount')
  getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked)).should('equal', expectedAmount)
  getActionValue('supply-amount', getTimeoutCategory('evm.simulation', isMocked), 'previous').should(
    'equal',
    expectedAmount,
  )
}
