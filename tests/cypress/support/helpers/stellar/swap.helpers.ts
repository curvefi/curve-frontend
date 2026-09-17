import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import type { PoolState } from '@cy/support/helpers/stellar/pool.helpers'
import { cyMap, LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { range } from '@primitives/objects.utils'
import { SWAP_FIELDS, type SwapSide } from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalDiv, decimalMinus, fromWei } from '@ui/lib/decimal'
import { formatToken } from '@ui/lib/tokens'

// get_dx estimates input; allow two receiving-token base units when exchange rounds the output.
const SWAP_ROUNDING_UNITS = '2' satisfies Decimal

const SWAP_SIDES = ['pay', 'receive'] as const

export const swapInput = (side: SwapSide) => cy.get(`[data-testid="pool-swap-${side}"]`, LOAD_TIMEOUT)
export const swapAmountInput = (side: SwapSide) =>
  swapInput(side).find(`input[name="${SWAP_FIELDS[side].amountField}"]`)
export const swapSubmit = () => cy.get('[data-testid="pool-swap-submit"]', LOAD_TIMEOUT)

export const writeSwapAmount = (side: SwapSide, amount: Decimal) => {
  swapAmountInput(side).clear()
  swapAmountInput(side).type(amount)
  swapAmountInput(side).blur()
}

export const selectSwapToken = (side: SwapSide, token: PoolState['coins'][number]) => {
  swapInput(side).find('[role="combobox"]').click()
  cy.get(`[data-testid="token-option-${token.address.toLowerCase()}"]`).click()
  swapInput(side).should('contain.text', token.symbol)
}

export const checkSwapBalances = ({ coins }: PoolState, fromIndex: number, toIndex: number) =>
  cyMap(SWAP_SIDES, side => {
    const coin = coins[{ fromIndex, toIndex }[SWAP_FIELDS[side].amountIndexField]]
    swapInput(side).should('contain.text', coin.symbol)
    return swapInput(side).find('[data-testid="balance-value"]').should('have.attr', 'data-value', coin.balance)
  })

export const readSwapAmounts = () =>
  cyMap(SWAP_SIDES, side =>
    swapAmountInput(side)
      .invoke('val')
      .then(value => String(value) as Decimal),
  ).then(([inputAmount, outputAmount]) => ({ inputAmount, outputAmount }))

export const checkSwapDetails = (
  { inputAmount, outputAmount }: { inputAmount: Decimal; outputAmount: Decimal },
  fromToken: PoolState['coins'][number],
  toToken: PoolState['coins'][number],
) => {
  getActionValue('pool-swap-exchange-rate').should(
    'equal',
    `${formatToken(1, fromToken.symbol)} = ${formatToken(decimalDiv(outputAmount, inputAmount), toToken.symbol, 'balance')}`,
  )
  const minimum = calculateMinimumReceived(
    outputAmount,
    useUserProfileStore.getState().maxSlippage.stable,
    toToken.decimals,
  )
  getActionValue('pool-swap-minimum-received').should(
    'equal',
    `${formatNumber(minimum, 'token.balance')} ${toToken.symbol}`,
  )
}

export const submitSwapForm = () => {
  swapSubmit().should('be.enabled').click()
  cy.get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT).should('contain.text', 'Swap confirmed')
  cyMap(SWAP_SIDES, side => swapAmountInput(side).should('have.value', ''))
  swapSubmit().should('be.disabled')
}

export const checkSwapResult = (
  state: PoolState,
  fresh: PoolState,
  { inputAmount, outputAmount }: { inputAmount: Decimal; outputAmount: Decimal },
  fromIndex: number,
  toIndex: number,
) => {
  const sent = decimalMinus(state.coins[fromIndex].balance, fresh.coins[fromIndex].balance)
  const received = decimalMinus(fresh.coins[toIndex].balance, state.coins[toIndex].balance)
  expect(sent, 'amount paid').to.equal(inputAmount)
  const roundingTolerance = +fromWei(SWAP_ROUNDING_UNITS, state.coins[toIndex].decimals)
  expect(+received, 'amount received').to.be.closeTo(+outputAmount, roundingTolerance)
  range(fresh.coins.length)
    .filter(index => index !== fromIndex && index !== toIndex)
    .forEach(index =>
      expect(fresh.coins[index].balance, `${fresh.coins[index].symbol} wallet balance`).to.equal(
        state.coins[index].balance,
      ),
    )
  expect(fresh.lp.balance, 'LP balance').to.equal(state.lp.balance)
  expect(fresh.supply, 'LP supply').to.equal(state.supply)
  checkSwapBalances(fresh, fromIndex, toIndex)
}
