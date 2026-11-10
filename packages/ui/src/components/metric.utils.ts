import type { Amount } from '@primitives/decimal.utils'
import { formatNumber, type NumberFormatCategory } from '@primitives/number.utils'

/** Let the number category format the original value, including any abbreviation. */
export const formatCategory = (category: NumberFormatCategory) => ({
  abbreviate: false,
  formatter: (value: Amount) => formatNumber(value, category),
})
