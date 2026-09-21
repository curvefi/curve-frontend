import type { Amount } from '@primitives/decimal.utils'
import type { NumberFormatCategory } from '@primitives/number.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'

export const UNAVAILABLE_TOKEN_SYMBOL = '?'
type TokenSymbol = string | Nullish
type TokenPair = readonly [TokenSymbol, TokenSymbol]
type TokenSymbols = TokenSymbol | TokenPair

/** Formats a token pair as a unit, e.g. ['wstETH', 'crvUSD'] becomes 'wstETH/crvUSD'. */
export const getTokenPairUnit = ([first, second]: TokenPair) =>
  first && second ? `${first}/${second}` : UNAVAILABLE_TOKEN_SYMBOL

const isTokenPair = (symbols: TokenSymbols): symbols is TokenPair => Array.isArray(symbols)

/** Formats a token amount with compact suffixes for dense displays, e.g. "1.23k CRV". */
export const formatToken = <T extends Amount | Nullish>(
  value: T,
  symbols: TokenSymbols,
  category: Extract<NumberFormatCategory, `token.${string}`> extends `token.${infer Category}`
    ? Category
    : never = 'compact',
) =>
  [
    formatNumber(value, `token.${category}`),
    isTokenPair(symbols) ? getTokenPairUnit(symbols) : (symbols ?? UNAVAILABLE_TOKEN_SYMBOL),
  ].join(' ')
