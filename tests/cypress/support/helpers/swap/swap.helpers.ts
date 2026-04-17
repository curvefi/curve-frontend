import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'

export const ExpectedExchangeRate = /1 ETH = \d\.\d\dk USDT/

const getFromAmountInput = (options = {}) => cy.get('[data-testid="from-amount"] [name="fromAmount"]', options)
const getToAmountInput = (options = {}) => cy.get('[data-testid="to-amount"] [name="toAmount"]', options)

/**
 * Type an amount into the swap from-input.
 * Waits for the stepper buttons to appear first — they only render once pageLoaded=true
 * AND the wallet signer is set, ensuring the amount is stored under the correct active key.
 */
export function writeSwapForm({ amount }: { amount: string }) {
  cy.get('[data-testid="approval"], [data-testid="swap"]', LOAD_TIMEOUT)
  getFromAmountInput(LOAD_TIMEOUT).should('be.enabled')
  getFromAmountInput().type(amount)
  getFromAmountInput().blur()
}

/**
 * Check that the swap route details (exchange rate, price impact, to-amount) have loaded.
 */
export function checkSwapDetailsLoaded() {
  getToAmountInput(LOAD_TIMEOUT).should(($el) => {
    expect($el.val()).to.match(/^\d+(\.\d+)?$/)
  })
  getActionValue('exchange-rate').should('match', ExpectedExchangeRate)
  cy.get('[data-testid="price-impact-value"]', LOAD_TIMEOUT).should('contain', '%')
}

/**
 * Submit the swap form. For native tokens (ETH), approval resolves automatically.
 * For ERC20 tokens, clicks approve first if needed, then swap.
 * Returns a Cypress chainable that resolves when the transaction success message is shown.
 */
export function submitApprovedSwap() {
  cy.get('[data-testid="swap"]', TRANSACTION_LOAD_TIMEOUT).click()
  return cy.contains('Transaction complete', TRANSACTION_LOAD_TIMEOUT)
}
