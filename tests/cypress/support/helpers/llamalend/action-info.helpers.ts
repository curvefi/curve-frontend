import { TIMEOUTS, getTimeoutCategory, type TimeoutCategory } from '@cy/support/timeout-categories'
import { type Decimal, DECIMAL_REGEX as FULL_DECIMAL_REGEX } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'

type ActionInfoField = 'previous' | 'left' | 'right' | 'value'
export const getActionInfo = (name: string, category: TimeoutCategory, field: ActionInfoField = 'value') =>
  cy.get(`[data-testid="${notFalsy(name, field).join('-')}"]`, TIMEOUTS[category])

export const DECIMAL_REGEX = new RegExp(FULL_DECIMAL_REGEX.source.slice(1, -1)) // remove the start and end anchors
export const DECIMAL_RANGE_REGEX = new RegExp([DECIMAL_REGEX.source, DECIMAL_REGEX.source].join(' - '))

/** Reads the value once it has loaded: while loading, the future value shows the current one under a skeleton */
export const getActionValue = (name: string, category: TimeoutCategory, field?: ActionInfoField) =>
  getActionInfo(name, category, field)
    .not('.MuiSkeleton-root *', TIMEOUTS[category])
    .invoke(TIMEOUTS[category], 'attr', 'data-value')

/** Extract plain decimal tokens with comma grouping; abbreviated values are unsupported. */
const extractDecimalValues = (text: string) =>
  text
    .replaceAll(',', '')
    .split(/\s+/)
    .filter(value => FULL_DECIMAL_REGEX.test(value)) as Decimal[]

/** Read a numeric value by position: valueIndex 1 selects "0.98" in "1 USDZ = 0.98 USDX". */
export const getActionDecimal = (
  name: string,
  category: TimeoutCategory,
  { valueIndex = 0 }: { valueIndex?: number } = {},
) =>
  getActionValue(name, category)
    .should(value => {
      expect(value, `${name} text`).to.be.a('string')
      expect(
        extractDecimalValues(value!)[valueIndex],
        `${name}: numeric value #${valueIndex + 1} in "${value}"`,
      ).to.be.a('string')
    })
    .then(value => extractDecimalValues(value!)[valueIndex])

export const getMetricValue = (name: string, category: TimeoutCategory) =>
  cy.get(`[data-testid="${name}-value"]`, TIMEOUTS[category]).invoke(TIMEOUTS[category], 'attr', 'data-value')

export const checkEstimatedTxCost = ({
  hasValue = true,
  name = 'estimated-tx-cost',
  category,
}: {
  hasValue?: boolean
  name?: string
  category: TimeoutCategory
}) =>
  hasValue
    ? getActionValue(name, category).should('include', '$')
    : getActionValue(name, category).should('be.undefined')

export type DebtCheck = { current: Decimal; future: Decimal; symbol: string }
/**
 * Checks the current and future debt values, and that the symbol is displayed correctly.
 */
export const checkDebt = (
  { current, future, symbol }: DebtCheck,
  { checkLoanToValue = true, isMocked = false }: { checkLoanToValue?: boolean; isMocked?: boolean } = {},
) => {
  getActionValue('borrow-debt', getTimeoutCategory('tenderly', 'simulation', isMocked)).should(
    'equal',
    formatNumber(future, 'token.amount'),
  )
  getActionValue('borrow-debt', getTimeoutCategory('tenderly', 'simulation', isMocked), 'right').should(
    'contain',
    symbol,
  )
  getActionValue('borrow-debt', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
    'equal',
    formatNumber(current, 'token.amount'),
  )
  if (checkLoanToValue) {
    getActionValue('borrow-ltv', getTimeoutCategory('tenderly', 'simulation', isMocked)).should('include', '%')
    getActionValue('borrow-ltv', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
      'include',
      '%',
    )
  }
}

/**
 * Checks that the current debt is as expected, and future value is displayed.
 */
export const checkCurrentDebt = (expectedCurrentDebt: Decimal, isMocked = false) => {
  getActionInfo('borrow-debt', getTimeoutCategory('tenderly', 'simulation', isMocked)).should('be.visible')
  const expected = formatNumber(expectedCurrentDebt, 'token.amount')
  getActionValue('borrow-debt', getTimeoutCategory('tenderly', 'simulation', isMocked)).should('equal', expected)
  getActionValue('borrow-debt', getTimeoutCategory('tenderly', 'simulation', isMocked), 'previous').should(
    'equal',
    expected,
  )
}

export function touchInput(getInputFn: () => Cypress.Chainable) {
  getInputFn().should('have.value', '')
  getInputFn().type('0')
  getInputFn().blur()
}
