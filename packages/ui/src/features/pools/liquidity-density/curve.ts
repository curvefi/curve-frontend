import { zip } from '@primitives/array.utils'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, maybes, range } from '@primitives/objects.utils'
import { decimalDiv, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { iterate } from './math'
import type { LiquidityCurve, LiquidityPair } from './types'

// flet-curve-demo/src/curve/liquidity.py: Curve, _walk, balance_at_price, peak_price.
// Reference commit: 5831c2416080e27c9c7018c281c48e21cae9beeb.
const PRICE_SEARCH_ITERATIONS = 200
const MAX_BALANCE_SEARCH_FACTOR = 1e9
const PRICE_SEARCH_TOLERANCE = 1e-9
const PRICE_DIFFERENCE_STEP_RATIO = 1e-7
const BRACKET_GROWTH_FACTOR = 2

/** Apply rates, then rescale balances near 1 to avoid large intermediate values in the solvers. */
export const curveCoordinates = (balances: readonly Amount[], rates: readonly Amount[]) => {
  const values = zip([...balances], [...rates]).map(([balance, rate]) => decimalMultiply(`${balance}`, rate))
  if (!values.every(v => +v)) return // Empty reserves cannot define a marginal price.
  const unit = decimalDiv(decimalSum(...values), `${values.length}`)
  const xp = values.map(value => +decimalDiv(value, unit))
  const scale = rates.map(rate => +decimalDiv(unit, `${rate}`))
  return { xp, scale, unit }
}

const balanceAt = ({ solve, xp }: LiquidityCurve, [inputCoin, outputCoin]: LiquidityPair, x: number) =>
  solve(
    xp.map((value, index) => (index === inputCoin ? x : value)),
    outputCoin,
  )

/** Whole output tokens per input token, before fees. Other pool balances stay fixed. */
const priceAt = (curve: LiquidityCurve, pair: LiquidityPair, x: number) => {
  const { scale } = curve
  const [inputCoin, outputCoin] = pair
  const step = x * PRICE_DIFFERENCE_STEP_RATIO
  return maybes([balanceAt(curve, pair, x - step), balanceAt(curve, pair, x + step)], (before, after) => {
    const slope = (before - after) / (2 * step)
    const price = (slope * scale[outputCoin]) / scale[inputCoin]
    return price > 0 ? price : undefined // Numerical differentiation must give a positive marginal price.
  })
}

export const spotPrice = (curve: LiquidityCurve, pair: LiquidityPair) => {
  const { xp } = curve
  const [inputCoin] = pair
  return priceAt(curve, pair, xp[inputCoin])
}

const bracketPrice = (priceOf: (x: number) => number | undefined, start: number, target: number, grow: boolean) =>
  iterate<{ x: number; step: number; bracket?: readonly [number, number] } | undefined>(
    { x: start, step: BRACKET_GROWTH_FACTOR },
    range(PRICE_SEARCH_ITERATIONS),
    ({ x, step }) => {
      const trial = grow ? x * step : x / step
      if (trial > start * MAX_BALANCE_SEARCH_FACTOR || trial < start / MAX_BALANCE_SEARCH_FACTOR) return
      const price = priceOf(trial)
      if (price == null) {
        const nextStep = 1 + (step - 1) / 2
        return nextStep < 1 + PRICE_SEARCH_TOLERANCE ? undefined : { x, step: nextStep }
      }
      if (grow ? price <= target : price >= target) {
        return { x, step, bracket: grow ? [x, trial] : [trial, x] }
      }
      return { x: trial, step }
    },
    ({ bracket }) => bracket != null,
  )?.bracket // The curve does not reach this price if undefined

/** Invert the decreasing marginal price with a geometric bracket followed by bisection. */
export const balanceAtPrice = (curve: LiquidityCurve, pair: LiquidityPair, target: number) => {
  const { xp } = curve
  const [inputCoin] = pair
  const here = xp[inputCoin]
  const priceOf = (x: number) => priceAt(curve, pair, x)
  return maybe(spotPrice(curve, pair), priceHere =>
    maybe(bracketPrice(priceOf, here, target, target < priceHere), bracket => {
      const [low, high] = iterate<readonly [number, number]>(
        bracket,
        range(PRICE_SEARCH_ITERATIONS),
        ([low, high]) => {
          const middle = (low + high) / 2
          return maybe(priceOf(middle), price => price > target) ? [middle, high] : [low, middle]
        },
        ([low, high]) => high - low <= high * PRICE_SEARCH_TOLERANCE,
      )
      return high - low <= high * PRICE_SEARCH_TOLERANCE ? (low + high) / 2 : undefined
    }),
  )
}

/** Price where the selected balances are equal in invariant coordinates. */
export const peakPrice = (curve: LiquidityCurve, pair: LiquidityPair) => {
  const { xp } = curve
  const [inputCoin] = pair
  const gap = (x: number) => maybe(balanceAt(curve, pair, x), b => x - b)
  const here = xp[inputCoin]
  return maybe(gap(here), hereGap => {
    if (!hereGap) return priceAt(curve, pair, here)
    const end = range(PRICE_SEARCH_ITERATIONS)
      .map(step =>
        hereGap > 0 ? here / BRACKET_GROWTH_FACTOR ** (step + 1) : here * BRACKET_GROWTH_FACTOR ** (step + 1),
      )
      .find(
        x =>
          x < here / MAX_BALANCE_SEARCH_FACTOR ||
          x > here * MAX_BALANCE_SEARCH_FACTOR ||
          (maybe(gap(x), value => (hereGap > 0 ? value <= 0 : value >= 0)) ?? true),
      )
    return maybe(end, end =>
      end < here / MAX_BALANCE_SEARCH_FACTOR || end > here * MAX_BALANCE_SEARCH_FACTOR
        ? undefined // No balance point below or above the pool
        : maybe(gap(end), () => {
            const bounds = iterate<readonly [number, number] | undefined>(
              hereGap > 0 ? [end, end * BRACKET_GROWTH_FACTOR] : [end / BRACKET_GROWTH_FACTOR, end],
              range(PRICE_SEARCH_ITERATIONS),
              ([low, high]) => {
                const middle = (low + high) / 2
                return maybe(gap(middle), (value): readonly [number, number] =>
                  value > 0 ? [low, middle] : [middle, high],
                )
              },
              ([low, high]) => high - low <= high * PRICE_SEARCH_TOLERANCE,
            )
            return maybe(bounds, ([low, high]) =>
              high - low <= high * PRICE_SEARCH_TOLERANCE ? priceAt(curve, pair, (low + high) / 2) : undefined,
            ) // Could not locate the balanced price if undefined
          }),
    )
  })
}
