import type { TokenOption } from './types'

type SearchOrderingOptions = {
  balances?: Record<string, string | number | undefined>
  tokenPrices?: Record<string, number | undefined>
}

const value = (number: string | number | undefined) => Number(number) || 0

const bySymbolAndAddress = (a: TokenOption, b: TokenOption) =>
  a.symbol.localeCompare(b.symbol) || a.address.localeCompare(b.address)

/** Sorts searched token matches into owned and remaining groups. */
export const orderSearchTokens = (
  tokens: readonly TokenOption[],
  { balances, tokenPrices }: SearchOrderingOptions,
): [TokenOption[], TokenOption[]] => {
  const owned = tokens.filter(token => value(balances?.[token.address]) > 0)
  const remaining = tokens.filter(token => value(balances?.[token.address]) === 0)

  // eslint-disable-next-line local/no-mutable-array-methods -- Sorting copies created above.
  owned.sort((a, b) => {
    const aBalance = value(balances?.[a.address])
    const bBalance = value(balances?.[b.address])
    return (
      value(tokenPrices?.[b.address]) * bBalance - value(tokenPrices?.[a.address]) * aBalance ||
      bBalance - aBalance ||
      bySymbolAndAddress(a, b)
    )
  })
  // eslint-disable-next-line local/no-mutable-array-methods -- Sorting copies created above.
  remaining.sort((a, b) => value(b.volume) - value(a.volume) || bySymbolAndAddress(a, b))

  return [owned, remaining]
}
