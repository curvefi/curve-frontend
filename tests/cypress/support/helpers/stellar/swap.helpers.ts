import { getActionValue, DECIMAL_REGEX } from '@cy/support/helpers/llamalend/action-info.helpers'
import type { PoolState } from '@cy/support/helpers/stellar/pool.helpers'
import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { cyMap } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { SWAP_FIELDS, type SwapSide } from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { decimalDiv, decimalMinus } from '@ui/lib/decimal'
import { formatToken } from '@ui/lib/tokens'

const SWAP_SIDES = ['pay', 'receive'] as const

export const swapInput = (side: SwapSide) => cy.get(`[data-testid="pool-swap-${side}"]`, TIMEOUTS['ui.render'])
export const swapAmountInput = (side: SwapSide, options?: Cypress.Timeoutable) =>
  swapInput(side).find(`input[name="${SWAP_FIELDS[side].amountField}"]`, options)
export const swapSubmit = () => cy.get('[data-testid="pool-swap-submit"]', TIMEOUTS['ui.render'])

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

export const readSwapAmounts = (editedSide: SwapSide) =>
  cyMap(SWAP_SIDES, side =>
    swapAmountInput(side, side === editedSide ? undefined : TIMEOUTS['stellar.simulation'])
      .should(input => expect(+input.val()!).to.be.greaterThan(0))
      .invoke('val')
      .then(value => value as Decimal),
  ).then(([inputAmount, outputAmount]) => ({ inputAmount, outputAmount }))

export const readSwapMinimum = () =>
  getActionValue('pool-swap-minimum-received', 'stellar.simulation')
    .should('match', DECIMAL_REGEX)
    .then(value => value!.match(DECIMAL_REGEX)![0] as Decimal)

export const checkSwapDetails = (
  { inputAmount, outputAmount }: { inputAmount: Decimal; outputAmount: Decimal },
  fromToken: PoolState['coins'][number],
  toToken: PoolState['coins'][number],
) => {
  getActionValue('pool-swap-exchange-rate', 'stellar.simulation').should(
    'equal',
    `${formatToken(1, fromToken.symbol)} = ${formatToken(decimalDiv(outputAmount, inputAmount), toToken.symbol, 'balance')}`,
  )
  const minimum = calculateMinimumReceived(
    outputAmount,
    useUserProfileStore.getState().maxSlippage.stable,
    toToken.decimals,
  )
  getActionValue('pool-swap-minimum-received', 'stellar.simulation').should(
    'equal',
    `${formatNumber(minimum, 'token.balance')} ${toToken.symbol}`,
  )
}

export const submitSwapForm = () => {
  submitAndExpectToast(() => swapSubmit().click(), { message: 'Swap confirmed' }, 'stellar.confirmation')
  cyMap(SWAP_SIDES, side => swapAmountInput(side).should('have.value', ''))
  swapSubmit().should('be.disabled')
}

/** Check the pay and receive balances displayed by the form. */
export const checkSwapResult = (
  { coins }: PoolState,
  {
    inputAmount,
    minimumOutputAmount,
    outputAmount,
  }: { inputAmount: Decimal; minimumOutputAmount: Decimal; outputAmount?: Decimal },
  fromIndex: number,
  toIndex: number,
) => {
  swapInput('pay')
    .find('[data-testid="balance-value"]', TIMEOUTS['stellar.read'])
    .should('have.attr', 'data-value', decimalMinus(coins[fromIndex].balance, inputAmount))
  swapInput('receive')
    .find('[data-testid="balance-value"]', TIMEOUTS['stellar.read'])
    .should(element => {
      const received = decimalMinus(element.attr('data-value') as Decimal, coins[toIndex].balance)
      expect(+received, 'received wallet balance').to.be.gte(+minimumOutputAmount)
      if (outputAmount) expect(received).to.equal(outputAmount)
    })
}
