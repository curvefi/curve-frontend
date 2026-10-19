import { range } from '@primitives/objects.utils'
import { MIN_RELATIVE_PRICE_WIDTH } from './constants'
import { balanceAtPrice, isPositiveFinite, peakPrice, spotPrice } from './curve'
import { iterate } from './math'
import type { LiquidityCurve, LiquidityPair, LiquidityProfile, LiquidityProfileOptions, LiquiditySample } from './types'

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
const DEFAULT_PROFILE_POINTS = 160
const MIN_PROFILE_POINTS = 2
const MAX_PROFILE_POINTS = 1000

const depthAt = (curve: LiquidityCurve, pair: LiquidityPair, price: number) => {
  const below = balanceAtPrice(curve, pair, price / (1 + DEPTH_PRICE_STEP_RATIO))
  const above = balanceAtPrice(curve, pair, price * (1 + DEPTH_PRICE_STEP_RATIO))
  if (below == null || above == null) return undefined
  return (Math.abs(above - below) * DENSITY_LOG_PRICE_BAND) / (2 * Math.log1p(DEPTH_PRICE_STEP_RATIO))
}

/** Include spot and the balanced price, with five half-height peak widths on either side. */
const liquidityWindow = (curve: LiquidityCurve, pair: LiquidityPair): readonly [number, number] | undefined => {
  const { seed } = curve
  const spot = spotPrice(curve, pair)
  if (spot == null) return undefined
  const peak = peakPrice(curve, pair) ?? spot
  const backgroundSamples = BACKGROUND_PRICE_MULTIPLIERS.flatMap(offset => {
    const depth = depthAt(curve, pair, spot * offset)
    return depth == null ? [] : [depth]
  })
  const backgroundDepth = backgroundSamples.length ? Math.min(...backgroundSamples) : 0
  const depth = depthAt(curve, pair, peak)
  if (depth == null) return undefined
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
      const depth = depthAt(curve, pair, peak * (1 + middle))
      return depth != null && depth - backgroundDepth > peakDepth * HALF_PEAK_DEPTH_RATIO
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
}

/** Density is whole input tokens per 1% of log-price movement; price is output/input. */
export const liquidityProfile = (
  curve: LiquidityCurve,
  pair: LiquidityPair,
  { low: requestedLow, high: requestedHigh, points = DEFAULT_PROFILE_POINTS }: LiquidityProfileOptions = {},
): LiquidityProfile | undefined => {
  const { scale } = curve
  const [inputCoin] = pair
  const spot = spotPrice(curve, pair)
  if (spot == null) return undefined
  const bounds =
    requestedLow == null && requestedHigh == null ? liquidityWindow(curve, pair) : [requestedLow, requestedHigh]
  if (!bounds) return undefined
  const [low, high] = bounds
  if (low == null || high == null || !Number.isFinite(high) || !(0 < low && low < high)) {
    return undefined // Provide both bounds of a positive price range
  }
  if (!Number.isInteger(points) || points < MIN_PROFILE_POINTS || points > MAX_PROFILE_POINTS) {
    return undefined // The sample count must be within the supported limits
  }
  const span = Math.log(high / low)
  const edges = range(points + 1).map(index => {
    const price = low * Math.exp((span * index) / points)
    return { price, balance: balanceAtPrice(curve, pair, price) }
  })
  const samples: LiquiditySample[] = edges.slice(1).flatMap(({ price: high, balance }, index) => {
    const { price: low, balance: previousBalance } = edges[index]
    // Keep domain gaps visible instead of drawing liquidity through an unsolved interval.
    if (previousBalance == null || balance == null) return []
    const width = Math.log(high / low)
    const depth = ((Math.abs(balance - previousBalance) * DENSITY_LOG_PRICE_BAND) / width) * scale[inputCoin]
    if (width <= 0 || !Number.isFinite(depth)) return []
    return [{ price: Math.sqrt(low * high), depth, low, high }]
  })
  if (!samples.length) return undefined // No liquidity could be sampled in this price range
  return { samples, spot, pair, low, high }
}

/** Convert density to USD (or another fixed denomination) without solving the curve again. */
export const valueLiquidityProfile = (
  { samples, ...profile }: LiquidityProfile,
  inputTokenPrice: number,
): LiquidityProfile | undefined => {
  if (!isPositiveFinite(inputTokenPrice)) return undefined // Input token price must be finite and positive
  return { ...profile, samples: samples.map(({ depth, ...sample }) => ({ ...sample, depth: depth * inputTokenPrice })) }
}
