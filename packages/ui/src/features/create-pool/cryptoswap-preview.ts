import { maybe, maybes, range } from '@primitives/objects.utils'
import { DENSITY_LOG_PRICE_BAND, liquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createTriCryptoCurve } from '@ui/features/pools/liquidity-density/tricrypto'
import { createTwoCryptoCurve } from '@ui/features/pools/liquidity-density/twocrypto'

const A_PRECISION = 10_000
const PREVIEW_PAIR = [0, 1] as const
const PREVIEW_BIN_COUNT = 193 // odd count centers a bin on the balanced price; extra bins resolve the narrow peak.

/** A uses the contract's 10,000 precision; gamma is unscaled. Reserves start at equal value. */
export const cryptoswapPreview = (amplification: number, gamma: number, tokenCount: 2 | 3) => {
  if (![amplification, gamma].every(value => Number.isFinite(value) && value > 0)) return
  const balances = range(tokenCount).map(() => 1)
  // At balanced, normalized reserves the invariant equals the number of coins.
  const curve =
    tokenCount === 2
      ? createTwoCryptoCurve(balances, 1, amplification / A_PRECISION, gamma, tokenCount)
      : createTriCryptoCurve(balances, [1, 1], amplification / A_PRECISION, gamma, tokenCount)
  return maybe(curve, curve =>
    maybe(liquidityProfile(curve, PREVIEW_PAIR, PREVIEW_BIN_COUNT), profile => {
      const samples = profile.samples.map(({ price, depth, low, high }) => ({
        deviation: (price - 1) * 100,
        // Compare the same log-price interval and total deposit: Uniswap v2 starts with N/2 per reserve.
        depth:
          (depth * Math.log(high / low)) /
          (DENSITY_LOG_PRICE_BAND * (tokenCount / 2) * (1 / Math.sqrt(low) - 1 / Math.sqrt(high))),
      }))
      const depth = Math.max(...samples.map(sample => sample.depth))
      // Estimate the range at half the peak excess depth over constant product (1×).
      const threshold = 1 + (depth - 1) / 2
      const first = samples.findIndex(sample => sample.depth >= threshold)
      const last = samples.findLastIndex(sample => sample.depth >= threshold)
      const crossing = (index: number) =>
        maybes([samples[index], samples[index + 1]], (left, right) =>
          left.depth === right.depth
            ? undefined
            : left.deviation +
              ((threshold - left.depth) * (right.deviation - left.deviation)) / (right.depth - left.depth),
        )
      return {
        samples,
        depth,
        band:
          depth > 1 ? maybes([crossing(first - 1), crossing(last)], (low, high) => [low, high] as const) : undefined,
      }
    }),
  )
}
