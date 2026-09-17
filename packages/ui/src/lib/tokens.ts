import type { Amount } from '@primitives/decimal.utils'
import type { NumberFormatCategory } from '@primitives/number.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'

export const UNAVAILABLE_TOKEN_SYMBOL = '?'
/** Formats a token amount with compact suffixes for dense displays, e.g. "1.23k CRV". */
export const formatToken = <T extends Amount | Nullish>(
  value: T,
  symbol: string | Nullish,
  category: Extract<NumberFormatCategory, `token.${string}`> extends `token.${infer Category}`
    ? Category
    : never = 'compact',
) => [formatNumber(value, `token.${category}`), symbol ?? UNAVAILABLE_TOKEN_SYMBOL].join(' ')
