import type { Amount } from '@primitives/decimal.utils'
import type { NumberFormatCategory } from './number'
import { formatNumber } from './number'

export const UNAVAILABLE_TOKEN_SYMBOL = '?'
/** Formats a token amount with compact suffixes for dense displays, e.g. "1.23k CRV". */
export const formatToken = <T extends Amount | null | undefined>(
  value: T,
  symbol: string | undefined | null,
  category: Extract<NumberFormatCategory, `token.${string}`> extends `token.${infer Category}`
    ? Category
    : never = 'compact',
) => [formatNumber(value, `token.${category}`), symbol ?? UNAVAILABLE_TOKEN_SYMBOL].join(' ')
