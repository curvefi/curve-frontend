import { decimalDiv, decimalMultiply } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

export const oneMonthProjectionYield = (apy: Decimal, balance: Decimal) =>
  decimalDiv(decimalMultiply(apy, balance), '1200')
export const oneYearProjectionYield = (apy: Decimal, balance: Decimal) =>
  decimalDiv(decimalMultiply(apy, balance), '100')
