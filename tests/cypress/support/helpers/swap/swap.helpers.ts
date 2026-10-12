import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { DECIMAL_REGEX } from '@primitives/decimal.utils'

const ExpectedExchangeRate = /1 ETH = \d+(?:\.\d{2,4})?k USDC/

const getFromAmountInput = (options = {}) => cy.get('[data-testid="from-amount"] [name="fromAmount"]', options)
const getToAmountInput = (options = {}) => cy.get('[data-testid="to-amount"] [name="toAmount"]', options)

/**
 * Type an amount into the swap from-input.
 * Waits for the stepper buttons to appear first — they only render once pageLoaded=true
 * AND the wallet signer is set, ensuring the amount is stored under the correct active key.
 */
export function writeSwapForm({ amount }: { amount: string }) {
  cy.get('[data-testid="approval"], [data-testid="swap"]', TIMEOUTS['ui.render'])
  getFromAmountInput(TIMEOUTS['ui.render']).should('be.enabled')
  getFromAmountInput().type(amount)
  getFromAmountInput().blur()
}

/**
 * Check that the swap route details (exchange rate, price impact, to-amount) have loaded.
 */
export function checkSwapDetailsLoaded() {
  getToAmountInput(TIMEOUTS['evm.simulation']).should($el => expect($el.val()).to.match(DECIMAL_REGEX))
  getActionValue('exchange-rate', 'ui.render').should('match', ExpectedExchangeRate)
  cy.get('[data-testid="price-impact-value"]').should('contain', '%')
}

/**
 * Submit the swap form. For native tokens (ETH), approval resolves automatically.
 * For ERC20 tokens, clicks approve first if needed, then swap.
 * Returns a Cypress chainable that resolves when the transaction success message is shown.
 */
export function submitApprovedSwap() {
  cy.get('[data-testid="swap"]', TIMEOUTS['evm.allowance']).click()
  return cy.contains('Transaction complete', TIMEOUTS['evm.confirmation'])
}
