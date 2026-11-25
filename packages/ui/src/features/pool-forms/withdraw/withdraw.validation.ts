import { test } from 'vest'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { OneCoinWithdrawQuoteQuery } from './one-coin-withdraw-quote'

export const validateOneCoinWithdrawQuote = ({
  amount,
  supply,
  decimals,
  index,
  slippage,
}: FieldsOf<DeepPartial<OneCoinWithdrawQuoteQuery>>) => {
  validateSlippage({ slippage })
  test('index', 'Invalid pool token index', () => {
    enforce(index)
      .isNumber()
      .condition(Number.isInteger)
      .gte(0)
      .lt(decimals?.length ?? 0)
  })
  const precision = decimals?.[index!]
  test('decimals', 'Token precision is unavailable', () => {
    enforce(precision).isNumber().condition(Number.isInteger).gte(0)
  })
  test('amount', 'Enter a valid token amount', () => {
    enforce(amount)
      .isDecimal({ decimal_digits: `0,${precision ?? 0}` })
      .gt(0)
  })
  test('supply', 'Pool supply is unavailable', () => {
    enforce(supply)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      .gt(0)
  })
}
