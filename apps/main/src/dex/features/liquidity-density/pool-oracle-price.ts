import type { Amount } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'

/** Oracle entries price coins 1..n in coin 0; return output tokens per input token. */
export const pairOraclePrice = (prices: readonly Amount[] | Nullish, [inputCoin, outputCoin]: LiquidityPair) => {
  const coinPrices = [1, ...(prices ?? [])]
  const inputPrice = Number(coinPrices[inputCoin])
  const outputPrice = Number(coinPrices[outputCoin])
  const price = inputPrice / outputPrice
  return [inputPrice, outputPrice, price].every(value => Number.isFinite(value) && value > 0) ? price : undefined
}
