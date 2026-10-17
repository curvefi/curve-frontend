import { range } from '@primitives/objects.utils'
import { balanceAtPrice, isPositiveFinite, peakPrice, spotPrice } from './curve'
import { iterate } from './math'
import type { LiquidityCurve, LiquidityPair, LiquidityProfile, LiquidityProfileOptions, LiquiditySample } from './types'

// Port of flet-curve-demo/src/curve/liquidity.py: depth_at, background, auto_window, profile.
// Reference commit: 5831c2416080e27c9c7018c281c48e21cae9beeb.
const BAND = 0.01
const MIN_WIDTH = 2e-4
const MAX_WIDTH = 2

const depthAt = (curve: LiquidityCurve, pair: LiquidityPair, price: number) => {
  const band = 1e-4
  const below = balanceAtPrice(curve, pair, price / (1 + band))
  const above = balanceAtPrice(curve, pair, price * (1 + band))
  if (below == null || above == null) return undefined
  return (Math.abs(above - below) * BAND) / (2 * Math.log1p(band))
}

/** Include spot and the balanced price, with five half-height peak widths on either side. */
const liquidityWindow = (curve: LiquidityCurve, pair: LiquidityPair): readonly [number, number] | undefined => {
  const { seed } = curve
  const spot = spotPrice(curve, pair)
  if (spot == null) return undefined
  const peak = peakPrice(curve, pair) ?? spot
  const backgroundSamples = [3, 2, 1 / 3, 1 / 2].flatMap(offset => {
    const depth = depthAt(curve, pair, spot * offset)
    return depth == null ? [] : [depth]
  })
  const backgroundDepth = backgroundSamples.length ? Math.min(...backgroundSamples) : 0
  const depth = depthAt(curve, pair, peak)
  if (depth == null) return undefined
  const peakDepth = depth - backgroundDepth
  if (peakDepth <= 0) return [spot / (1 + MAX_WIDTH), spot * (1 + MAX_WIDTH)]

  const [low, high] = iterate<readonly [number, number]>(
    [Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, seed * 1e-3)), MAX_WIDTH],
    range(48),
    ([low, high]) => {
      const middle = Math.sqrt(low * high)
      const depth = depthAt(curve, pair, peak * (1 + middle))
      return depth != null && depth - backgroundDepth > peakDepth * 0.5 ? [middle, high] : [low, middle]
    },
    ([low, high]) => high / low < 1.02,
  )
  const margin = Math.min(Math.max(Math.sqrt(low * high) * 5, MIN_WIDTH), MAX_WIDTH)
  const insideLow = Math.min(spot, peak)
  const insideHigh = Math.max(spot, peak)
  const lower = insideLow / (1 + margin)
  const upper = insideHigh * (1 + margin)
  const pad = Math.log(upper / lower) * 0.12
  return [
    Math.max(lower * Math.exp(-pad), insideLow / (1 + MAX_WIDTH)),
    Math.min(upper * Math.exp(pad), insideHigh * (1 + MAX_WIDTH)),
  ]
}

/** Density is whole input tokens per 1% of log-price movement; price is output/input. */
export const liquidityProfile = (
  curve: LiquidityCurve,
  pair: LiquidityPair,
  { low: requestedLow, high: requestedHigh, points = 160 }: LiquidityProfileOptions = {},
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
  if (!Number.isInteger(points) || points < 2 || points > 1000) {
    return undefined // The sample count must be between 2 and 1000
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
    const depth = ((Math.abs(balance - previousBalance) * BAND) / width) * scale[inputCoin]
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
