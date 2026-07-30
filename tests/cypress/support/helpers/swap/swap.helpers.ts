import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouteProvider, RouterRouteResponse } from '@primitives/router.utils'

export const ExpectedExchangeRate = /1 ETH = \d+(?:\.\d{2,4})?k USDT/

export const ROUTER_QUOTE_ALIASES = {
  amountIn: 'routerAmountIn',
  amountOut: 'routerAmountOut',
} as const

const USDT_PER_ETH = 2000n
const DECIMAL_SCALE = 10n ** 12n

const firstQueryValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

/**
 * Fixtures disconnected swap quotes in both exact-input and exact-output directions.
 */
export const mockDisconnectedSwapQuotes = () => {
  cy.intercept('GET', '**/api/router/v1/routes*', req => {
    const query = req.query as Record<string, string | string[] | undefined>
    const requestedAmountIn = firstQueryValue(query.amountIn)
    const requestedAmountOut = firstQueryValue(query.amountOut)

    if (!requestedAmountIn && !requestedAmountOut) return req.reply([])

    const tokenIn = firstQueryValue(query.tokenIn) as Address
    const tokenOut = firstQueryValue(query.tokenOut) as Address
    const router = firstQueryValue(query.router) as RouteProvider
    const chainId = Number(firstQueryValue(query.chainId))
    const amountIn = (requestedAmountIn ??
      ((BigInt(requestedAmountOut!) * USDT_PER_ETH) / DECIMAL_SCALE).toString()) as Decimal
    const amountOut = (requestedAmountOut ??
      ((BigInt(requestedAmountIn!) * DECIMAL_SCALE) / USDT_PER_ETH).toString()) as Decimal

    req.alias = requestedAmountIn ? ROUTER_QUOTE_ALIASES.amountIn : ROUTER_QUOTE_ALIASES.amountOut
    req.reply([
      {
        router,
        amountIn: [amountIn],
        amountOut: [amountOut],
        gas: null,
        priceImpact: 0.01,
        createdAt: Date.now(),
        warnings: [],
        isStableswapRoute: false,
        route: [
          {
            name: 'Fixture pool',
            tokenIn: [tokenIn],
            tokenOut: [tokenOut],
            protocol: router,
            action: 'swap',
            chainId,
            args: {},
          },
        ],
      } satisfies RouterRouteResponse,
    ])
  })
}

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
  getToAmountInput(LOAD_TIMEOUT).should($el => {
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
