import { submitAndExpectToast, type ToastOptions } from '@cy/support/helpers/toast.helpers'
import { TIMEOUTS, getTimeoutCategory } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import {
  checkEstimatedTxCost as checkEstimatedTxCostValue,
  DECIMAL_REGEX,
  getActionValue,
} from '../action-info.helpers'

type SupplyFormType = 'deposit' | 'withdraw' | 'stake' | 'unstake'
export type SupplyActionType = SupplyFormType | 'claim-crv-rewards' | 'claim-other-rewards'

const getSupplyInput = (type: SupplyFormType) =>
  cy.get(`[data-testid="supply-${type}-input"] input[type="text"]`, TIMEOUTS['ui.render'])

const getSupplyInputBalanceValue = (type: SupplyFormType, isMocked = false) =>
  cy.get(
    `[data-testid="supply-${type}-input"] [data-testid="balance-value"]`,
    TIMEOUTS[getTimeoutCategory('tenderly', 'balances', isMocked)],
  )

export const getSupplyInputBalanceValueAttr = (type: SupplyFormType, isMocked = false) =>
  getSupplyInputBalanceValue(type, isMocked).invoke(
    TIMEOUTS[getTimeoutCategory('tenderly', 'balances', isMocked)],
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

export const submitSupplyForm = (type: SupplyActionType, options: ToastOptions, isMocked = false) =>
  submitAndExpectToast(
    () => cy.get(`[data-testid="supply-${type}-submit-button"]`).click(TIMEOUTS['ui.interaction']),
    options,
    getTimeoutCategory('tenderly', 'submit', isMocked),
  )

export const checkSupplySubmitButtonText = (type: SupplyFormType, buttonText: string, isMocked = false) =>
  cy
    .get(
      `[data-testid="supply-${type}-submit-button"]`,
      TIMEOUTS[getTimeoutCategory('tenderly', 'allowance', isMocked)],
    )
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
    getActionValue('supply-apy', getTimeoutCategory('tenderly', 'simulation', isMocked)).should(
      'equal',
      formatNumber(supplyApy as Decimal, 'percent.rate'),
    )
  }
  if (prevSupplyApy != null) {
    getActionValue('supply-apy', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
      'equal',
      formatNumber(prevSupplyApy as Decimal, 'percent.rate'),
    )
  }
  if (vaultShares != null) {
    getActionValue('supply-vault-shares', getTimeoutCategory('tenderly', 'simulation', isMocked)).should(
      'equal',
      formatNumber(vaultShares as Decimal, { abbreviate: true }),
    )
  }
  if (prevVaultShares != null) {
    getActionValue('supply-vault-shares', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
      'equal',
      formatNumber(prevVaultShares as Decimal, { abbreviate: true }),
    )
  }
  if (suppliedAssets != null) {
    getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked)).should(
      'equal',
      formatNumber(suppliedAssets as Decimal, { abbreviate: false }),
    )
  }
  if (prevSuppliedAssets != null) {
    getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
      'equal',
      formatNumber(prevSuppliedAssets as Decimal, { abbreviate: false }),
    )
  }
  if (symbol) {
    getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked), 'right').should(
      'contain',
      symbol,
    )
  }

  checkEstimatedTxCostValue({ hasValue: hasApi, category: getTimeoutCategory('tenderly', 'simulation', isMocked) })
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
  getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked)).should('equal', expected)
  getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
    'equal',
    expected,
  )
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
    getActionValue('supply-vault-shares', getTimeoutCategory('tenderly', 'simulation', isMocked)).should(
      'match',
      DECIMAL_REGEX,
    )
    getActionValue('supply-vault-shares', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
      'match',
      DECIMAL_REGEX,
    )
  } else {
    getActionValue('supply-vault-shares', getTimeoutCategory('tenderly', 'simulation', isMocked)).should('equal', '0')
    getActionValue('supply-vault-shares', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
      'equal',
      '0',
    )
  }

  const expectedAmount = formatNumber(expectedAmountSupplied, 'token.amount')
  getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked)).should(
    'equal',
    expectedAmount,
  )
  getActionValue('supply-amount', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
    'equal',
    expectedAmount,
  )
}
