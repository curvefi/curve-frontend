import { enforce, skipWhen, test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'

export const validateSlippage = ({
  slippage,
  required = true,
}: {
  required?: boolean
  slippage: Decimal | null | undefined
}) => {
  skipWhen(slippage == null && !required, () => {
    test('slippage', 'Slippage must be a number between 0 and 100', () => {
      enforce(slippage).isNumeric().gte(0).lte(100)
    })
  })
}
