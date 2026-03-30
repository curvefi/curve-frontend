import BigNumber from 'bignumber.js'
import type { Address } from 'viem'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatPercent } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils'
import { getActionValue } from '../action-info.helpers'

export const SUPPLY_TEST_MARKETS = [
  {
    id: 'one-way-market-7',
    label: 'sUSDe-crvUSD Old Lend Market',
    chainId: Chain.Ethereum,
    borrowedTokenAddress: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as Address,
    vaultAddress: '0x52096539ed1391CB50C6b9e4Fd18aFd2438ED23b' as Address,
    gaugeAddress: '0x82195f78c313540e0363736b8320a256a019f7dd' as Address,
    deposit: '12.5' as Decimal,
    partialWithdraw: '2.5' as Decimal,
    borrowedTokenDecimals: 18,
  },
  {
    id: 'one-way-market-41',
    label: 'sreUSD-crvUSD New Lend Market',
    chainId: Chain.Ethereum,
    borrowedTokenAddress: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as Address,
    vaultAddress: '0xC32B0Cf36e06c790A568667A17DE80cba95A5Aad' as Address,
    gaugeAddress: '0x29e9975561fad3a7988ca96361ab5c5317cb32af' as Address,
    deposit: '12.5' as Decimal,
    partialWithdraw: '2.5' as Decimal,
    borrowedTokenDecimals: 18,
  },
] as const

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
 * Check that supply callbacks were called (onSuccess, onPricesUpdated).
 */
export const expectSupplyCallbacks = ({
  onSuccess,
  onPricesUpdated,
  expectPricesUpdated = true,
}: {
  onSuccess: ReturnType<typeof cy.stub>
  onPricesUpdated?: ReturnType<typeof cy.stub>
  expectPricesUpdated?: boolean
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  expect(onSuccess).to.be.calledOnce
  if (onPricesUpdated && expectPricesUpdated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(onPricesUpdated).to.be.called
  }
}

/**
 * Capture wallet balance before an operation for later comparison.
 * Returns a chainable that yields the balance value.
 */
export const captureWalletBalance = (type: SupplyFormType) =>
  getSupplyInputBalanceValueAttr(type).should('not.be.empty')

/**
 * Verify wallet balance changed by the expected delta after an operation.
 */
export const expectWalletBalanceDelta = ({
  balanceBefore,
  expectedDelta,
  tolerance = '0.0001',
  type,
}: {
  balanceBefore: Decimal
  expectedDelta: Decimal
  tolerance?: Decimal
  type: SupplyFormType
}) => {
  getSupplyInputBalanceValueAttr(type)
    .should('not.be.empty')
    .then((balanceAfter) => {
      const actualDelta = new BigNumber(balanceAfter as string).minus(balanceBefore)
      const expectedDeltaBn = new BigNumber(expectedDelta)
      const toleranceBn = new BigNumber(tolerance)
      expect(actualDelta.minus(expectedDeltaBn).abs().lte(toleranceBn)).to.equal(true)
    })
}
