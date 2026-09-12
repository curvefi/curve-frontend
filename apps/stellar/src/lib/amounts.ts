import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { fromWei, toWei } from '@ui/lib/decimal'

export const MAX_I128 = (1n << 127n) - 1n

export const LP_TOKEN_DECIMALS = 18

/** Apply slippage and floor at LP-token precision, returning a decimal LP amount. */
export const minimumMint = (quote: Decimal, slippage: Decimal): Decimal =>
  fromWei(
    new BigNumber(toWei(quote, LP_TOKEN_DECIMALS))
      .times(new BigNumber(100).minus(slippage))
      .shiftedBy(-2)
      .integerValue(BigNumber.ROUND_FLOOR)
      .toFixed(),
    LP_TOKEN_DECIMALS,
  )
