import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'

/**
 * Returns the maximum Decimal value from an array of Decimals, without losing precision.
 */
export const decimalMax = (...data: Decimal[]): Decimal | undefined =>
  data.reduce<Decimal | undefined>(
    (max, value) => (max == null ? value : new BigNumber(value).isGreaterThan(max) ? value : max),
    undefined,
  )

export const decimalCompare = (a: Decimal, b: Decimal) => BigNumber(a).comparedTo(b) ?? 0
