import { createPublicClient, erc20Abi, formatUnits, http, type Address } from 'viem'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { CRVUSD_DECIMALS } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalCompare } from '@ui-kit/utils'
import { DECIMAL_REGEX, getActionValue, getMetricValue } from './action-info.helpers'

type ScrvUsdFormType = 'deposit' | 'withdraw'

const getScrvUsdInput = (type: ScrvUsdFormType) =>
  cy.get(`[data-testid="scrvusd-${type}-input"] input[type="text"]`, LOAD_TIMEOUT)

export const writeScrvUsdDepositForm = (amount: Decimal) => writeScrvUsdInput('deposit', amount)

export const writeScrvUsdWithdrawForm = (amount: Decimal) => writeScrvUsdInput('withdraw', amount)

const writeScrvUsdInput = (type: ScrvUsdFormType, amount: Decimal) => {
  getScrvUsdInput(type).clear()
  getScrvUsdInput(type).type(amount)
  getScrvUsdInput(type).blur()
  cy.get(`[data-testid="scrvusd-${type}-action-info-list"]`, LOAD_TIMEOUT).should('be.visible')
}

export const writeInvalidThenValidScrvUsdDeposit = ({
  invalidAmount,
  validAmount,
}: {
  invalidAmount: Decimal
  validAmount: Decimal
}) => {
  writeScrvUsdDepositForm(invalidAmount)
  checkMaxAmountError()
  getScrvUsdInput('deposit').clear()
  getScrvUsdInput('deposit').type(validAmount)
  getScrvUsdInput('deposit').blur()
}

export const writeInvalidThenValidScrvUsdWithdraw = ({
  invalidAmount,
  validAmount,
}: {
  invalidAmount: Decimal
  validAmount: Decimal
}) => {
  writeScrvUsdWithdrawForm(invalidAmount)
  checkMaxAmountError()
  getScrvUsdInput('withdraw').clear()
  getScrvUsdInput('withdraw').type(validAmount)
  getScrvUsdInput('withdraw').blur()
}

const checkMaxAmountError = () => cy.contains('Amount exceeds maximum of', LOAD_TIMEOUT).should('be.visible')

export const setScrvUsdInfiniteAllowance = (approveInfinite: boolean) => {
  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', LOAD_TIMEOUT).should('not.be.checked')
  if (!approveInfinite) return

  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', LOAD_TIMEOUT).click({ force: true })
  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', LOAD_TIMEOUT).should('be.checked')
}

const readCrvUsdAllowance = ({ publicRpcUrl, userAddress }: { publicRpcUrl: string; userAddress: Address }) =>
  cy.then(async () => {
    const publicClient = createPublicClient({ transport: http(publicRpcUrl) })
    const allowance = await publicClient.readContract({
      address: CRVUSD_ADDRESS,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress, SCRVUSD_VAULT_ADDRESS],
    })

    return formatUnits(allowance, CRVUSD_DECIMALS) as Decimal
  })

export const checkScrvUsdDepositAllowance = ({
  approveInfinite,
  publicRpcUrl,
  userAddress,
  depositAmount,
}: {
  approveInfinite: boolean
  publicRpcUrl: string
  userAddress: Address
  depositAmount: Decimal
}) =>
  readCrvUsdAllowance({ publicRpcUrl, userAddress }).should(allowance =>
    expect(decimalCompare(allowance, approveInfinite ? depositAmount : '0')).to.equal(approveInfinite ? 1 : 0),
  )

export const checkNoFormErrors = () => {
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('body').should('not.contain', 'Amount exceeds maximum of')
}

const checkLoadedActionValue = (testId: string) =>
  getActionValue(testId).should(value => {
    expect(value).to.be.a('string').and.not.equal('').and.not.equal('-')
    expect(value).not.to.contain('...')
  })

const checkLoadedUsdActionValue = (testId: string) => {
  checkLoadedActionValue(testId)
  getActionValue(testId).should('contain', '$')
}

type PositionDetailsState = 'zero' | 'positive'

const checkMetricValue = (testId: string, expected: PositionDetailsState) =>
  getMetricValue(testId).should(value =>
    ({
      zero: () => expect(decimalCompare(value as Decimal, '0')).to.equal(0),
      positive: () => expect(decimalCompare(value as Decimal, '0')).to.equal(1),
    })[expected](),
  )

export const checkScrvUsdPositionDetails = (expected: PositionDetailsState) => {
  checkMetricValue('scrvusd-position-staked', expected)
  checkMetricValue('scrvusd-position-share', expected)
  checkMetricValue('scrvusd-position-projection-30d', expected)
  checkMetricValue('scrvusd-position-projection-1y', expected)
  getMetricValue('scrvusd-position-apy').should('match', DECIMAL_REGEX)
}

export const checkScrvUsdDepositDetailsLoaded = () => {
  cy.get('[data-testid="scrvusd-deposit-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
  getActionValue('scrvusd-deposit-exchange-rate')
    .should('contain', '1 crvUSD =')
    .and('contain', 'scrvUSD')
    .and('not.contain', '...')
  getActionValue('scrvusd-deposit-to-vault').should('contain', 'scrvUSD').and('not.contain', '...')
  cy.get('[data-testid="scrvusd-infinite-allowance"]', LOAD_TIMEOUT).should('be.visible')
  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', LOAD_TIMEOUT).should('exist')
  checkLoadedUsdActionValue('scrvusd-deposit-estimated-tx-cost')
  checkNoFormErrors()
}

export const checkScrvUsdWithdrawDetailsLoaded = () => {
  cy.get('[data-testid="scrvusd-withdraw-action-info-list"]', LOAD_TIMEOUT).should('be.visible')
  checkLoadedActionValue('scrvusd-withdraw-receive')
  getActionValue('scrvusd-withdraw-receive', 'right').should('contain', 'crvUSD')
  getActionValue('scrvusd-deposit-exchange-rate')
    .should('contain', '1 crvUSD =')
    .and('contain', 'scrvUSD')
    .and('not.contain', '...')
  checkLoadedUsdActionValue('estimated-tx-cost')
  checkNoFormErrors()
}

export const submitScrvUsdDepositForm = () => {
  cy.get('[data-testid="scrvusd-deposit-submit-button"]', LOAD_TIMEOUT).should(button =>
    expect(button.text()).to.be.oneOf(['Approve & Deposit', 'Deposit']),
  )
  cy.get('[data-testid="scrvusd-deposit-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Deposit successful!', TRANSACTION_LOAD_TIMEOUT)
}

export const submitScrvUsdWithdrawForm = (expectedButtonText: 'Withdraw' | 'Redeem') => {
  cy.get('[data-testid="scrvusd-withdraw-submit-button"]', LOAD_TIMEOUT).should('have.text', expectedButtonText)
  cy.get('[data-testid="scrvusd-withdraw-submit-button"]', LOAD_TIMEOUT).click()
  return cy
    .get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT)
    .contains('Withdraw successful!', TRANSACTION_LOAD_TIMEOUT)
}

export const selectMaxScrvUsdWithdraw = () =>
  cy.get('[data-testid="input-chip-100%"]', LOAD_TIMEOUT).click({ force: true })

export const readScrvUsdWithdrawBalance = () =>
  cy
    .get('[data-testid="scrvusd-withdraw-input"] [data-testid="balance-value"]', LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .should(balance => expect(balance).to.be.a('string').and.not.equal(''))
    .then(balance => balance as Decimal)

export const checkScrvUsdWithdrawBalanceGreaterThan = (expectedMinimum: Decimal) =>
  readScrvUsdWithdrawBalance().should(balance => expect(decimalCompare(balance, expectedMinimum)).to.equal(1))

export const checkScrvUsdWithdrawBalanceLessThan = (expectedMaximum: Decimal) =>
  readScrvUsdWithdrawBalance().should(balance => expect(decimalCompare(balance, expectedMaximum)).to.equal(-1))

export const checkScrvUsdWithdrawBalanceZero = () =>
  readScrvUsdWithdrawBalance().should(balance => expect(+balance, `Expected ${balance} to be zero`).to.equal(0))
