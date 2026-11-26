import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { getTimeoutCategory, TIMEOUTS } from '@cy/support/timeout-categories'
import { cyMap } from '@cy/support/ui'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'

export const poolWithdrawInput = (address: Address) =>
  cy.get(`[data-testid="pool-token-input-${address}"]`, TIMEOUTS['ui.render'])

export const poolWithdrawLpInput = () => cy.get('[data-testid="pool-withdraw-lp-input"]', TIMEOUTS['ui.render'])
export const poolWithdrawSubmit = () => cy.get('[data-testid="pool-withdraw-submit"]', TIMEOUTS['tenderly.simulation'])

export const writePoolWithdrawLp = (amount: Decimal) => {
  poolWithdrawLpInput().find('input', TIMEOUTS['tenderly.balances']).clear()
  poolWithdrawLpInput().find('input').type(amount)
  poolWithdrawLpInput().find('input').blur()
}

export const writePoolWithdrawAmount = (address: Address, amount: Decimal) => {
  poolWithdrawInput(address).find('input[name^="amount"]').clear()
  poolWithdrawInput(address).find('input[name^="amount"]').type(amount)
  poolWithdrawInput(address).find('input[name^="amount"]').blur()
}

export const getPoolWithdrawAmount = (address: Address) =>
  poolWithdrawInput(address)
    .find('input[name^="amount"]')
    .should('not.have.value', '')
    .invoke('attr', 'data-value')
    .then(value => value as Decimal)

export const getPoolWithdrawAmounts = (coins: readonly { address: Address }[]) =>
  cyMap(coins, ({ address }) => getPoolWithdrawAmount(address))

export const getPoolWithdrawLpBalance = () =>
  poolWithdrawLpInput()
    .find('[data-testid="balance-value"]', TIMEOUTS['tenderly.balances'])
    .invoke('attr', 'data-value')

export const getPoolWithdrawDetail = (detail: 'current-lp' | 'projected-lp') =>
  getActionValue(
    'pool-withdraw-current-lp',
    detail === 'current-lp' ? 'tenderly.balances' : 'tenderly.simulation',
    detail === 'current-lp' ? 'previous' : 'value',
  )

export const checkPoolWithdrawDetail = (detail: 'current-lp' | 'projected-lp', amount: Decimal) =>
  getPoolWithdrawDetail(detail).should('equal', formatNumber(amount, 'token.balance'))

export const selectPoolWithdrawCoin = (address: Address) => {
  cy.get('[data-testid="withdraw-token-select"]', TIMEOUTS['ui.render']).click()
  cy.get(`[data-testid="token-option-${address}"]`).click()
}

export const selectPoolWithdrawMax = (address: Address) => {
  selectPoolWithdrawCoin(address)
  poolWithdrawInput(address).find('[data-testid="input-chip-Max"]', TIMEOUTS['tenderly.simulation']).click()
  checkPoolWithdrawDetail('projected-lp', '0')
}

export const submitPoolWithdraw = (isMocked = false) =>
  submitAndExpectToast(
    () => poolWithdrawSubmit().click(),
    { message: 'Withdrawal successful!', approvalMessage: 'Approved withdrawal' },
    getTimeoutCategory('tenderly', 'submit', isMocked),
  )

/** Submit through the form and compare the refreshed LP balance with its preview. */
export const submitPoolWithdrawAndCheck = () => {
  poolWithdrawSubmit().should('be.enabled')
  getActionValue('pool-price-impact', 'tenderly.simulation').should('include', '%')
  getActionValue('estimated-tx-cost', 'tenderly.simulation').should('be.a', 'string').and('not.be.empty')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  return getPoolWithdrawDetail('current-lp').then(current =>
    getPoolWithdrawDetail('projected-lp')
      .should(value => expect(Number(value)).to.be.at.least(0).and.lessThan(Number(current)))
      .then(projected => {
        submitPoolWithdraw()
        cy.get('[data-testid^="pool-token-input-"] input:visible').should(inputs => {
          inputs.each((_, input) => {
            expect(input).to.have.value('')
          })
        })
        poolWithdrawSubmit().should('be.disabled')
        getPoolWithdrawDetail('current-lp').should('equal', projected)
      }),
  )
}
