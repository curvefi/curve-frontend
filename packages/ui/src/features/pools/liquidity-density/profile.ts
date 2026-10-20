import { zip } from '@primitives/array.utils'
import { maybe, maybes, notFalsy, range } from '@primitives/objects.utils'
import { MIN_RELATIVE_PRICE_WIDTH } from './constants'
import { balanceAtPrice, peakPrice, spotPrice } from './curve'
import { iterate } from './math'
import type { LiquidityCurve, LiquidityPair, LiquidityProfile, LiquiditySample } from './types'

// Port of flet-curve-demo/src/curve/liquidity.py: depth_at, background, auto_window, profile.
// Reference commit: 5831c2416080e27c9c7018c281c48e21cae9beeb.
/** Report density per 1% of log-price movement, estimated with a smaller symmetric price step. */
const DENSITY_LOG_PRICE_BAND = 0.01
const DEPTH_PRICE_STEP_RATIO = 1e-4
const MAX_RELATIVE_PRICE_WIDTH = 2
const BACKGROUND_PRICE_MULTIPLIERS = [3, 2, 1 / 3, 1 / 2] as const
const WIDTH_SEARCH_SEED_RATIO = 1e-3
const WIDTH_SEARCH_ITERATIONS = 48
const WIDTH_SEARCH_CONVERGENCE_RATIO = 1.02
const HALF_PEAK_DEPTH_RATIO = 0.5
const WINDOW_HALF_WIDTHS = 5
const WINDOW_LOG_PADDING_RATIO = 0.12
const PROFILE_BIN_COUNT = 48

const depthAt = (curve: LiquidityCurve, pair: LiquidityPair, price: number) =>
  maybes(
    [
      balanceAtPrice(curve, pair, price / (1 + DEPTH_PRICE_STEP_RATIO)),
      balanceAtPrice(curve, pair, price * (1 + DEPTH_PRICE_STEP_RATIO)),
    ],
    (below, above) => (Math.abs(above - below) * DENSITY_LOG_PRICE_BAND) / (2 * Math.log1p(DEPTH_PRICE_STEP_RATIO)),
  )

/** Include spot and the balanced price, with five half-height peak widths on either side. */
const liquidityWindow = (curve: LiquidityCurve, pair: LiquidityPair): readonly [number, number] | undefined => {
  const { seed } = curve
  return maybe(spotPrice(curve, pair), spot => {
    const peak = peakPrice(curve, pair) ?? spot
    const backgroundSamples = BACKGROUND_PRICE_MULTIPLIERS.map(offset => depthAt(curve, pair, spot * offset)).filter(
      depth => depth != null,
    )
    const backgroundDepth = backgroundSamples.length ? Math.min(...backgroundSamples) : 0
    return maybe(depthAt(curve, pair, peak), depth => {
      const peakDepth = depth - backgroundDepth
      if (peakDepth <= 0) return [spot / (1 + MAX_RELATIVE_PRICE_WIDTH), spot * (1 + MAX_RELATIVE_PRICE_WIDTH)]

      const [low, high] = iterate<readonly [number, number]>(
        [
          Math.min(MAX_RELATIVE_PRICE_WIDTH, Math.max(MIN_RELATIVE_PRICE_WIDTH, seed * WIDTH_SEARCH_SEED_RATIO)),
          MAX_RELATIVE_PRICE_WIDTH,
        ],
        range(WIDTH_SEARCH_ITERATIONS),
        ([low, high]) => {
          const middle = Math.sqrt(low * high)
          return maybe(
            depthAt(curve, pair, peak * (1 + middle)),
            depth => depth - backgroundDepth > peakDepth * HALF_PEAK_DEPTH_RATIO,
          )
            ? [middle, high]
            : [low, middle]
        },
        ([low, high]) => high / low < WIDTH_SEARCH_CONVERGENCE_RATIO,
      )
      const margin = Math.min(
        Math.max(Math.sqrt(low * high) * WINDOW_HALF_WIDTHS, MIN_RELATIVE_PRICE_WIDTH),
        MAX_RELATIVE_PRICE_WIDTH,
      )
      const insideLow = Math.min(spot, peak)
      const insideHigh = Math.max(spot, peak)
      const lower = insideLow / (1 + margin)
      const upper = insideHigh * (1 + margin)
      const pad = Math.log(upper / lower) * WINDOW_LOG_PADDING_RATIO
      return [
        Math.max(lower * Math.exp(-pad), insideLow / (1 + MAX_RELATIVE_PRICE_WIDTH)),
        Math.min(upper * Math.exp(pad), insideHigh * (1 + MAX_RELATIVE_PRICE_WIDTH)),
      ]
    })
  })
}

/** Density is whole input tokens per 1% of log-price movement; price is output/input. */
export const liquidityProfile = (curve: LiquidityCurve, pair: LiquidityPair): LiquidityProfile | undefined => {
  const { scale } = curve
  const [inputCoin] = pair
  return maybe(spotPrice(curve, pair), spot =>
    maybe(liquidityWindow(curve, pair), ([low, high]) => {
      const span = Math.log(high / low)
      const edges = range(PROFILE_BIN_COUNT + 1).map(index => {
        const price = low * Math.exp((span * index) / PROFILE_BIN_COUNT)
        return { price, balance: balanceAtPrice(curve, pair, price) }
      })
      const samples: LiquiditySample[] = notFalsy(
        ...zip(edges.slice(0, -1), edges.slice(1)).map(
          ([{ price: low, balance: previousBalance }, { price: high, balance }]) =>
            // Keep domain gaps visible instead of drawing liquidity through an unsolved interval.
            maybes([previousBalance, balance], (previous, current) => {
              const width = Math.log(high / low)
              const depth = ((Math.abs(current - previous) * DENSITY_LOG_PRICE_BAND) / width) * scale[inputCoin]
              return { price: Math.sqrt(low * high), depth, low, high }
            }),
        ),
      )
      if (!samples.length) return undefined // No liquidity could be sampled in this price range
      return { samples, spot, pair, low, high }
    }),
  )
}

/** Convert density to USD (or another fixed denomination) without solving the curve again. */
export const valueLiquidityProfile = (
  { samples, ...profile }: LiquidityProfile,
  inputTokenPrice: number,
): LiquidityProfile => ({
  ...profile,
  samples: samples.map(({ depth, ...sample }) => ({ ...sample, depth: depth * inputTokenPrice })),
})
