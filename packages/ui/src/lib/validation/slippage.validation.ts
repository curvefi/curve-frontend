import { skipWhen, test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'
import { MAX_SLIPPAGE, MIN_SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const validateSlippage = ({
  slippage,
  required = true,
}: {
  required?: boolean
  slippage: Decimal | Nullish
}) => {
  skipWhen(slippage == null && !required, () => {
    test('slippage', 'Slippage must be a number between 0 and 100', () => {
      enforce(slippage).isDecimal().gte(MIN_SLIPPAGE).lte(MAX_SLIPPAGE)
    })
  })
}
