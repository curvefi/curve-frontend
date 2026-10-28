import type { Amount } from '@primitives/decimal.utils'
import { formatNumber, type NumberFormatCategory } from '@primitives/number.utils'

/** Formats a PNL or ROE value with a + sign when it is positive */
export const formatSigned = (value: Amount, category: NumberFormatCategory) =>
  `${Number(value) > 0 ? '+' : ''}${formatNumber(value, category)}`
