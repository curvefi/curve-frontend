import type { Decimal } from '@primitives/decimal.utils'
import { decimalDiv, decimalMultiply } from '@ui/lib/decimal'

export const oneMonthProjectionYield = (apy: Decimal, balance: Decimal) =>
  decimalDiv(decimalMultiply(apy, balance), '1200')
export const oneYearProjectionYield = (apy: Decimal, balance: Decimal) =>
  decimalDiv(decimalMultiply(apy, balance), '100')
