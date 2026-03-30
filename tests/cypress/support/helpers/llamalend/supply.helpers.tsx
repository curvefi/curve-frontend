import BigNumber from 'bignumber.js'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatPercent } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'

export type SupplyFormType = 'deposit' | 'withdraw' | 'stake' | 'unstake'
const CLAIMABLE_AMOUNT_REGEX = /(\d[\d,]*(?:\.\d+)?)/

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

const submitSupplyForm = (testId: string, successMessage: string) => {
  cy.get(`[data-testid="${testId}"]`, LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains(successMessage, TRANSACTION_LOAD_TIMEOUT)
}

export const submitDepositForm = () => submitSupplyForm('supply-deposit-submit-button', 'Deposit successful!')

export const submitStakeForm = () => submitSupplyForm('supply-stake-submit-button', 'Stake successful!')

export const submitWithdrawForm = () => submitSupplyForm('supply-withdraw-submit-button', 'Withdraw successful!')

export const submitUnstakeForm = () => submitSupplyForm('supply-unstake-submit-button', 'Unstake successful!')

export const submitClaimForm = () => submitSupplyForm('supply-claim-submit-button', 'Claimed rewards!')

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
 * Fill in the deposit form with the specified amount.
 */
export function writeDepositForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'deposit', amount })
}

/**
 * Check all deposit detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkDepositDetailsLoaded({
  amountSupplied,
  prevAmountSupplied,
  symbol = 'crvUSD',
}: {
  amountSupplied: Decimal
  prevAmountSupplied: Decimal
  symbol?: string
}) {
  checkSupplyActionInfoValues({ amountSupplied, prevAmountSupplied, symbol })
}

/**
 * Touch the deposit form to refresh state after submission.
 */
export const touchDepositForm = () => touchSupplyInput('deposit')

/**
 * Check the current supplied amount after a deposit.
 */
export function checkCurrentSuppliedAmount(expectedAmount: Decimal) {
  const expected = formatNumber(expectedAmount, { abbreviate: false })
  getActionValue('supply-amount').should('equal', expected)
  getActionValue('supply-amount', 'previous').should('equal', expected)
}

/**
 * Fill in the withdraw form with the specified amount.
 */
export function writeWithdrawForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'withdraw', amount })
}

/**
 * Fill in the stake form with the specified amount.
 */
export function writeStakeForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'stake', amount })
}

/**
 * Check all stake detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkStakeDetailsLoaded({
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  expectedButtonText = 'Stake',
  symbol = 'crvUSD',
  checkEstimatedTxCost = true,
}: {
  vaultShares: Decimal
  prevVaultShares: Decimal
  amountSupplied?: Decimal
  prevAmountSupplied?: Decimal
  expectedButtonText?: string
  symbol?: string
  checkEstimatedTxCost?: boolean
}) {
  checkSupplyActionInfoValues({
    vaultShares,
    prevVaultShares,
    amountSupplied,
    prevAmountSupplied,
    symbol,
    checkEstimatedTxCost,
  })
  cy.get('[data-testid="supply-stake-submit-button"]').should('have.text', expectedButtonText)
}

/**
 * Touch the stake form to refresh state after submission.
 */
export const touchStakeForm = () => touchSupplyInput('stake')

/**
 * Check all withdraw detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkWithdrawDetailsLoaded({
  amountSupplied,
  prevAmountSupplied,
  expectedButtonText = 'Withdraw',
  symbol = 'crvUSD',
}: {
  amountSupplied: Decimal
  prevAmountSupplied: Decimal
  expectedButtonText?: string
  symbol?: string
}) {
  checkSupplyActionInfoValues({ amountSupplied, prevAmountSupplied, symbol })
  cy.get('[data-testid="supply-withdraw-submit-button"]').should('have.text', expectedButtonText)
}

/**
 * Select max withdraw by clicking the Max chip.
 */
export const selectMaxWithdraw = () => {
  cy.get('[data-testid="input-chip-Max"]', LOAD_TIMEOUT).click({ force: true })
}

/**
 * Touch the withdraw form to refresh state after submission.
 */
export const touchWithdrawForm = () => touchSupplyInput('withdraw')

/**
 * Fill in the unstake form with the specified amount.
 */
export function writeUnstakeForm({ amount }: { amount: Decimal }) {
  writeSupplyInput({ type: 'unstake', amount })
}

/**
 * Check all unstake detail values are loaded and valid.
 * The action info list is expected to be opened before calling this function.
 */
export function checkUnstakeDetailsLoaded({
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  expectedButtonText = 'Unstake',
  symbol = 'crvUSD',
  checkEstimatedTxCost = true,
}: {
  vaultShares: Decimal
  prevVaultShares: Decimal
  amountSupplied?: Decimal
  prevAmountSupplied?: Decimal
  expectedButtonText?: string
  symbol?: string
  checkEstimatedTxCost?: boolean
}) {
  checkSupplyActionInfoValues({
    vaultShares,
    prevVaultShares,
    amountSupplied,
    prevAmountSupplied,
    symbol,
    checkEstimatedTxCost,
  })
  cy.get('[data-testid="supply-unstake-submit-button"]').should('have.text', expectedButtonText)
}

/**
 * Touch the unstake form to refresh state after submission.
 */
export const touchUnstakeForm = () => touchSupplyInput('unstake')

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
