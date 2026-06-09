import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalCompare, formatNumber } from '@ui-kit/utils'
import { getActionValue } from './action-info.helpers'

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

export const checkNoFormErrors = () => {
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('body').should('not.contain', 'Amount exceeds maximum of')
}

const checkLoadedActionValue = (testId: string) => {
  getActionValue(testId).should(value => {
    expect(value).to.be.a('string').and.not.equal('').and.not.equal('-')
    expect(value).not.to.contain('...')
  })
}

const checkLoadedUsdActionValue = (testId: string) => {
  checkLoadedActionValue(testId)
  getActionValue(testId).should('contain', '$')
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
  cy.get('[data-testid="scrvusd-deposit-submit-button"]', LOAD_TIMEOUT).should(button => {
    expect(button.text()).to.be.oneOf(['Approve & Deposit', 'Deposit'])
  })
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

export const selectMaxScrvUsdWithdraw = () => {
  cy.get('[data-testid="input-chip-100%"]', LOAD_TIMEOUT).click({ force: true })
}

export const readScrvUsdWithdrawBalance = () =>
  cy
    .get('[data-testid="scrvusd-withdraw-input"] [data-testid="balance-value"]', LOAD_TIMEOUT)
    .invoke(LOAD_TIMEOUT, 'attr', 'data-value')
    .should(balance => {
      expect(balance).to.be.a('string').and.not.equal('')
    })
    .then(balance => balance as Decimal)

export const checkScrvUsdWithdrawBalanceGreaterThan = (expectedMinimum: Decimal) => {
  readScrvUsdWithdrawBalance().should(balance => {
    expect(decimalCompare(balance, expectedMinimum)).to.equal(1)
  })
}

export const checkScrvUsdWithdrawBalanceLessThan = (expectedMaximum: Decimal) => {
  readScrvUsdWithdrawBalance().should(balance => {
    expect(decimalCompare(balance, expectedMaximum)).to.equal(-1)
  })
}

export const checkScrvUsdWithdrawBalanceZero = () => {
  readScrvUsdWithdrawBalance().should(balance => {
    expect(
      decimalCompare(balance, '0'),
      `Expected ${formatNumber(balance, { abbreviate: false })} to be zero`,
    ).to.equal(0)
  })
}
