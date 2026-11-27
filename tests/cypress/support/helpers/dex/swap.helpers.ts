import { TEST_SLIPPAGE } from '@cy/support/helpers/dex/curve.helpers'
import { getActionDecimal, getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { getTimeoutCategory, TIMEOUTS } from '@cy/support/timeout-categories'
import { checkNoValidationErrors, cyMap } from '@cy/support/ui'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { SWAP_FIELDS, type SwapSide } from '@ui/features/pool-forms/swap/swap-form.utils'
import { decimalDiv, decimalMinus, decimalPercent } from '@ui/lib/decimal'

export const poolSwapInput = (side: SwapSide) => cy.get(`[data-testid="pool-swap-${side}"]`, TIMEOUTS['ui.render'])
export const poolSwapAmount = (side: SwapSide) =>
  poolSwapInput(side).find(`input[name="${SWAP_FIELDS[side].amountField}"]`)
export const poolSwapSubmit = () => cy.get('[data-testid="pool-swap-submit"]', TIMEOUTS['ui.render'])

const getPoolSwapBalance = (side: SwapSide) =>
  poolSwapInput(side).find('[data-testid="balance-value"]', TIMEOUTS['tenderly.balances']).invoke('attr', 'data-value')

export const writePoolSwapAmount = (side: SwapSide, amount: Decimal) => {
  poolSwapAmount(side).clear()
  poolSwapAmount(side).type(amount)
  poolSwapAmount(side).blur()
}

export const selectPoolSwapCoin = (side: SwapSide, address: Address) => {
  poolSwapInput(side).find('[role="combobox"]').click()
  cy.get(`[data-testid="token-option-${address}"]`).click()
}

export const checkPoolSwapDetails = (fromSymbol: string, toSymbol: string, isMocked = false) => {
  const category = getTimeoutCategory('tenderly', 'simulation', isMocked)
  getActionValue('pool-swap-exchange-rate', category).should('include', `1 ${fromSymbol} = `).and('include', toSymbol)
  cyMap(['pay', 'receive'] as const, side =>
    poolSwapAmount(side)
      .invoke('attr', 'data-value')
      .should(value => expect(Number(value)).gt(0)),
  ).then(([input, output]) => {
    const expectedRate = decimalDiv(output as Decimal, input as Decimal)
    getActionDecimal('pool-swap-exchange-rate', category, { valueIndex: 1 }).should(rate => {
      // Receive-side input quotes and the displayed rate can round independently.
      const deviation = decimalPercent(decimalMinus(rate, expectedRate), expectedRate)
      expect(Math.abs(Number(deviation)), 'exchange rate matches the quoted amounts').lte(Number(TEST_SLIPPAGE))
    })
    getActionDecimal('pool-minimum-received', category).should(minimum => {
      expect(Number(minimum), 'minimum received').gt(0).and.lte(Number(output))
    })
  })
  getActionValue('pool-minimum-received', category).should('include', ` ${toSymbol}`)
  getActionValue('borrow-slippage', category).should('equal', formatNumber(TEST_SLIPPAGE, 'percent.rate'))
  getActionValue('pool-price-impact', category).should('include', '%')
  getActionValue('estimated-tx-cost', category).should('include', '$')
  checkNoValidationErrors()
}

export const submitPoolSwap = (isMocked = false) =>
  submitAndExpectToast(
    () => poolSwapSubmit().click(),
    { message: 'Swap successful!', approvalMessage: 'Approved swap' },
    getTimeoutCategory('tenderly', 'submit', isMocked),
  ).then(() => {
    poolSwapAmount('pay').should('have.value', '')
    poolSwapAmount('receive').should('have.value', '')
    poolSwapSubmit().should('be.disabled')
  })

/** Compare refreshed wallet balances with the amounts shown before submission. */
export const submitPoolSwapAndCheck = () =>
  getPoolSwapBalance('pay').then(payBalance =>
    getPoolSwapBalance('receive').then(receiveBalance =>
      poolSwapAmount('pay')
        .invoke('attr', 'data-value')
        .then(input =>
          poolSwapAmount('receive')
            .invoke('attr', 'data-value')
            .then(output =>
              getActionDecimal('pool-minimum-received', 'tenderly.simulation').then(minimum => {
                submitPoolSwap()
                getPoolSwapBalance('pay').should('equal', decimalMinus(payBalance as Decimal, input as Decimal))
                getPoolSwapBalance('receive').should(balance => {
                  const received = decimalMinus(balance as Decimal, receiveBalance as Decimal)
                  const deviation = decimalPercent(decimalMinus(received, output as Decimal), output as Decimal)
                  expect(Number(received), 'received balance meets the displayed minimum').gte(Number(minimum))
                  expect(Math.abs(Number(deviation))).lte(Number(TEST_SLIPPAGE))
                })
              }),
            ),
        ),
    ),
  )
