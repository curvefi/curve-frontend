import { createPublicClient, erc20Abi, formatUnits, http, type Address } from 'viem'
import { CRVUSD_ADDRESS, SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { CRVUSD_DECIMALS } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalCompare, decimalMinus } from '@ui/lib/decimal'
import { DECIMAL_REGEX, getActionValue, getMetricValue } from './action-info.helpers'

type ScrvUsdFormType = 'deposit' | 'withdraw'

const getScrvUsdInput = (type: ScrvUsdFormType) =>
  cy.get(`[data-testid="scrvusd-${type}-input"] input[type="text"]`, TIMEOUTS['ui.render'])

const writeScrvUsdDepositForm = (amount: Decimal) => writeScrvUsdInput('deposit', amount)
const writeScrvUsdWithdrawForm = (amount: Decimal) => writeScrvUsdInput('withdraw', amount)

const writeScrvUsdInput = (type: ScrvUsdFormType, amount: Decimal) => {
  getScrvUsdInput(type).clear()
  getScrvUsdInput(type).type(amount)
  getScrvUsdInput(type).blur()
  cy.get(`[data-testid="scrvusd-${type}-action-info-list"]`, TIMEOUTS['ui.render']).should('be.visible')
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

const checkMaxAmountError = () => cy.contains('Amount exceeds maximum of', TIMEOUTS['ui.render']).should('be.visible')

export const setScrvUsdInfiniteAllowance = (approveInfinite: boolean) => {
  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', TIMEOUTS['ui.render']).should(
    'not.be.checked',
  )
  if (!approveInfinite) return

  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', TIMEOUTS['ui.interaction']).click({
    force: true,
  })
  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', TIMEOUTS['ui.render']).should('be.checked')
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

const checkNoFormErrors = () => {
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('body').should('not.contain', 'Amount exceeds maximum of')
}

const checkLoadedActionValue = (testId: string) =>
  getActionValue(testId, 'evm.simulation').should(value => {
    expect(value).to.be.a('string').and.not.equal('').and.not.equal('-')
    expect(value).not.to.contain('...')
  })

const checkLoadedUsdActionValue = (testId: string) => {
  checkLoadedActionValue(testId)
  getActionValue(testId, 'evm.simulation').should('contain', '$')
}

type PositionDetailsState = 'zero' | 'positive'

const checkMetricValue = (testId: string, expected: PositionDetailsState) =>
  getMetricValue(testId, 'evm.contractRead').should(value =>
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
  getMetricValue('scrvusd-position-apy', 'evm.contractRead').should('match', DECIMAL_REGEX)
}

export const checkScrvUsdDepositDetailsLoaded = () => {
  cy.get('[data-testid="scrvusd-deposit-action-info-list"]', TIMEOUTS['ui.render']).should('be.visible')
  getActionValue('scrvusd-deposit-exchange-rate', 'evm.simulation')
    .should('contain', '1 crvUSD =')
    .and('contain', 'scrvUSD')
    .and('not.contain', '...')
  getActionValue('scrvusd-deposit-to-vault', 'ui.render').should('contain', 'scrvUSD').and('not.contain', '...')
  cy.get('[data-testid="scrvusd-infinite-allowance"]', TIMEOUTS['ui.render']).should('be.visible')
  cy.get('[data-testid="scrvusd-infinite-allowance"] input[role="switch"]', TIMEOUTS['ui.render']).should('exist')
  checkLoadedUsdActionValue('scrvusd-deposit-estimated-tx-cost')
  checkNoFormErrors()
}

export const checkScrvUsdWithdrawDetailsLoaded = () => {
  cy.get('[data-testid="scrvusd-withdraw-action-info-list"]', TIMEOUTS['ui.render']).should('be.visible')
  checkLoadedActionValue('scrvusd-withdraw-receive')
  getActionValue('scrvusd-withdraw-receive', 'evm.simulation', 'right').should('contain', 'crvUSD')
  getActionValue('scrvusd-deposit-exchange-rate', 'evm.simulation')
    .should('contain', '1 crvUSD =')
    .and('contain', 'scrvUSD')
    .and('not.contain', '...')
  checkLoadedUsdActionValue('estimated-tx-cost')
  checkNoFormErrors()
}

export const submitScrvUsdDepositForm = () => {
  cy.get('[data-testid="scrvusd-deposit-submit-button"]', TIMEOUTS['evm.allowance']).should(button =>
    expect(button.text()).to.be.oneOf(['Approve & Deposit', 'Deposit']),
  )
  cy.get('[data-testid="scrvusd-deposit-submit-button"]', TIMEOUTS['ui.interaction']).click()
  return cy
    .get('[data-testid="toast-success"]', TIMEOUTS['evm.confirmation'])
    .contains('Deposit successful!', TIMEOUTS['evm.confirmation'])
}

export const submitScrvUsdWithdrawForm = (expectedButtonText: 'Withdraw' | 'Redeem') => {
  cy.get('[data-testid="scrvusd-withdraw-submit-button"]', TIMEOUTS['evm.allowance']).should(
    'have.text',
    expectedButtonText,
  )
  cy.get('[data-testid="scrvusd-withdraw-submit-button"]', TIMEOUTS['ui.interaction']).click()
  return cy
    .get('[data-testid="toast-success"]', TIMEOUTS['evm.confirmation'])
    .contains('Withdraw successful!', TIMEOUTS['evm.confirmation'])
}

export const selectMaxScrvUsdWithdraw = () =>
  cy.get('[data-testid="input-chip-100%"]', TIMEOUTS['ui.interaction']).click({ force: true })

export const readScrvUsdWithdrawBalance = () =>
  cy
    .get('[data-testid="scrvusd-withdraw-input"] [data-testid="balance-value"]', TIMEOUTS['evm.balances'])
    .invoke(TIMEOUTS['evm.balances'], 'attr', 'data-value')
    .should(balance => expect(balance).to.be.a('string').and.not.equal(''))
    .then(balance => balance as Decimal)

export const checkScrvUsdWithdrawBalanceGreaterThan = (expectedMinimum: Decimal) =>
  readScrvUsdWithdrawBalance().should(balance => expect(decimalCompare(balance, expectedMinimum)).to.equal(1))

export const checkScrvUsdWithdrawBalanceLessThan = (expectedMaximum: Decimal) =>
  readScrvUsdWithdrawBalance().should(balance => expect(decimalCompare(balance, expectedMaximum)).to.equal(-1))

export const checkScrvUsdWithdrawBalanceDecreasedBy = (initialBalance: Decimal, withdrawAmount: Decimal) =>
  readScrvUsdWithdrawBalance().should(balance =>
    expect(+balance).to.be.closeTo(+decimalMinus(initialBalance, withdrawAmount), 0.000001),
  )

export const checkScrvUsdWithdrawBalanceZero = () =>
  readScrvUsdWithdrawBalance().should(balance => expect(+balance, `Expected ${balance} to be zero`).to.equal(0))
