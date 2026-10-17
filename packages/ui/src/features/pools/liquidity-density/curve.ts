import { mean } from 'lodash'
import { maybe, range } from '@primitives/objects.utils'
import { iterate } from './math'
import type { LiquidityCurve, LiquidityPair } from './types'

export const SOLVER_ITERATIONS = 255
export const SOLVER_TOLERANCE = 1e-14

// flet-curve-demo/src/curve/liquidity.py: Curve, _walk, balance_at_price, peak_price.
// Reference commit: 5831c2416080e27c9c7018c281c48e21cae9beeb.
const MAX_STEPS = 200
const MAX_REACH = 1e9
const TOLERANCE = 1e-9
const searchSteps = range(MAX_STEPS)

export const isPositiveFinite = (value: number | undefined): value is number =>
  value != null && Number.isFinite(value) && value > 0

/** Apply rates, then rescale balances near 1 to avoid large intermediate values in the solvers. */
export const curveCoordinates = (balances: readonly number[], rates: readonly number[]) => {
  if (balances.length < 2 || balances.length !== rates.length) {
    return undefined // Balances and rates must describe the same pool
  }
  if (!balances.every(isPositiveFinite)) return undefined // Balance must be finite and positive
  if (!rates.every(isPositiveFinite)) return undefined // Rate must be finite and positive
  const values = balances.map((balance, index) => balance * rates[index])
  const unit = mean(values)
  if (!isPositiveFinite(unit)) return undefined // Balance scale must be finite and positive
  const xp = values.map(value => value / unit)
  const scale = rates.map(rate => unit / rate)
  if (!xp.every(isPositiveFinite) || !scale.every(isPositiveFinite)) return undefined
  return { xp, scale, unit }
}

export const isValidPair = ([inputCoin, outputCoin]: LiquidityPair, coinCount: number) =>
  inputCoin !== outputCoin &&
  [inputCoin, outputCoin].every(index => Number.isInteger(index) && index >= 0 && index < coinCount)

const balanceAt = ({ solve, xp }: LiquidityCurve, [inputCoin, outputCoin]: LiquidityPair, x: number) =>
  solve(
    xp.map((value, index) => (index === inputCoin ? x : value)),
    outputCoin,
  )

/** Whole output tokens per input token, before fees. Other pool balances stay fixed. */
const priceAt = (curve: LiquidityCurve, pair: LiquidityPair, x: number) => {
  const { scale } = curve
  const [inputCoin, outputCoin] = pair
  const step = x * 1e-7
  if (!isPositiveFinite(step)) return undefined // Difference step must be finite and positive
  const outputBefore = balanceAt(curve, pair, x - step)
  const outputAfter = balanceAt(curve, pair, x + step)
  if (outputBefore == null || outputAfter == null) return undefined
  const slope = (outputBefore - outputAfter) / (2 * step)
  const price = (slope * scale[outputCoin]) / scale[inputCoin]
  return isPositiveFinite(price) ? price : undefined // Marginal price must be finite and positive
}

export const spotPrice = (curve: LiquidityCurve, pair: LiquidityPair) => {
  const { xp } = curve
  const [inputCoin] = pair
  if (!isValidPair(pair, xp.length)) {
    return undefined // The pair must contain two distinct pool coin indices
  }
  return priceAt(curve, pair, xp[inputCoin])
}

const bracketPrice = (priceOf: (x: number) => number | undefined, start: number, target: number, grow: boolean) => {
  const result = iterate<{ x: number; step: number; bracket?: readonly [number, number] } | undefined>(
    { x: start, step: 2 },
    searchSteps,
    ({ x, step }) => {
      const trial = grow ? x * step : x / step
      if (trial > start * MAX_REACH || trial < start / MAX_REACH) return undefined
      const price = priceOf(trial)
      if (price == null) {
        const nextStep = 1 + (step - 1) / 2
        return nextStep < 1 + TOLERANCE ? undefined : { x, step: nextStep }
      }
      if (grow ? price <= target : price >= target) {
        return { x, step, bracket: grow ? [x, trial] : [trial, x] }
      }
      return { x: trial, step }
    },
    ({ bracket }) => bracket != null,
  )
  return result?.bracket // The curve does not reach this price if undefined
}

/** Invert the decreasing marginal price with a geometric bracket followed by bisection. */
export const balanceAtPrice = (curve: LiquidityCurve, pair: LiquidityPair, target: number) => {
  if (!isPositiveFinite(target)) return undefined // Target price must be finite and positive
  const { xp } = curve
  const [inputCoin] = pair
  const here = xp[inputCoin]
  const priceHere = spotPrice(curve, pair)
  if (priceHere == null) return undefined
  const priceOf = (x: number) => priceAt(curve, pair, x)
  const bracket = bracketPrice(priceOf, here, target, target < priceHere)
  if (!bracket) return undefined
  const [low, high] = iterate<readonly [number, number]>(
    bracket,
    searchSteps,
    ([low, high]) => {
      const middle = (low + high) / 2
      const price = priceOf(middle)
      return price != null && price > target ? [middle, high] : [low, middle]
    },
    ([low, high]) => high - low <= high * TOLERANCE,
  )
  return high - low <= high * TOLERANCE ? (low + high) / 2 : undefined // Price inversion did not converge
}

/** Price where the selected balances are equal in invariant coordinates. */
export const peakPrice = (curve: LiquidityCurve, pair: LiquidityPair) => {
  const { xp } = curve
  const [inputCoin] = pair
  if (!isValidPair(pair, xp.length)) return undefined
  const gap = (x: number) => maybe(balanceAt(curve, pair, x), b => x - b)
  const here = xp[inputCoin]
  const hereGap = gap(here)
  if (hereGap == null) return undefined
  if (hereGap === 0) return priceAt(curve, pair, here)
  const end = searchSteps
    .map(step => (hereGap > 0 ? here / 2 ** (step + 1) : here * 2 ** (step + 1)))
    .find(x => {
      if (x < here / MAX_REACH || x > here * MAX_REACH) return true
      const value = gap(x)
      return value == null || (hereGap > 0 ? value <= 0 : value >= 0)
    })
  if (end == null) return undefined // Could not locate the balanced price
  if (end < here / MAX_REACH) return undefined // No balance point below the pool
  if (end > here * MAX_REACH) return undefined // No balance point above the pool
  if (gap(end) == null) return undefined
  const bounds = iterate<readonly [number, number] | undefined>(
    hereGap > 0 ? [end, end * 2] : [end / 2, end],
    searchSteps,
    ([low, high]) => {
      const middle = (low + high) / 2
      return maybe(gap(middle), (value): readonly [number, number] => (value > 0 ? [low, middle] : [middle, high]))
    },
    ([low, high]) => high - low <= high * TOLERANCE,
  )
  return maybe(bounds, ([low, high]) =>
    high - low <= high * TOLERANCE ? priceAt(curve, pair, (low + high) / 2) : undefined,
  ) // Could not locate the balanced price if undefined
}
