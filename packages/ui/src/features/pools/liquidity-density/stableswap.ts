import { sum } from 'lodash'
import { range } from '@primitives/objects.utils'
import { MIN_RELATIVE_PRICE_WIDTH, SOLVER_ITERATIONS, SOLVER_TOLERANCE } from './constants'
import { curveCoordinates, isPositiveFinite } from './curve'
import { converge, productOfRatios } from './math'
import type { LiquidityCurve } from './types'

// Port of electric-router/src/erouter/core/stableswap.py: d_fast and solve_y_fast.
// Reference commit: 282fa4c8fd838c99f80c3c5fae26fbca9b8747cc.
const solverSteps = range(SOLVER_ITERATIONS)

/** Amplification is A_precise / A_PRECISION, or A() when the precise getter is unavailable. */
const stableInvariant = (balances: readonly number[], amplification: number): number | undefined => {
  const { length: n } = balances
  const total = sum(balances)
  const ann = amplification * n
  const denominators = balances.map(balance => balance * n)
  return converge(
    total,
    solverSteps,
    d => {
      const product = productOfRatios(d, d, denominators)
      const next = ((ann * total + product * n) * d) / ((ann - 1) * d + (n + 1) * product)
      return isPositiveFinite(next) ? next : undefined // Invariant must be finite and positive
    },
    (next, previous) => Math.abs(next - previous) <= SOLVER_TOLERANCE * next,
  ) // StableSwap invariant did not converge if undefined
}

const stableBalance = (
  balances: readonly number[],
  amplification: number,
  d: number,
  outputCoin: number,
): number | undefined => {
  const { length: n } = balances
  const ann = amplification * n
  const others = balances.filter((_, index) => index !== outputCoin)
  if (!others.every(isPositiveFinite)) return undefined // Balance must be finite and positive
  const denominators = others.map(balance => balance * n)
  const c = (productOfRatios(d, d, denominators) * d) / (ann * n)
  const b = sum(others) + d / ann
  return converge(
    d,
    solverSteps,
    y => {
      const next = (y * y + c) / (2 * y + b - d)
      return isPositiveFinite(next) ? next : undefined // Output balance must be finite and positive
    },
    (next, previous) => Math.abs(next - previous) <= SOLVER_TOLERANCE * next,
  ) // StableSwap output balance did not converge if undefined
}

/** Balances are whole tokens and rates are dimensionless multipliers, as returned by getStoredRates(false). */
export const createStableSwapCurve = (
  balances: readonly number[],
  rates: readonly number[],
  amplification: number,
  invariant?: number,
): LiquidityCurve | undefined => {
  if (!isPositiveFinite(amplification)) return undefined // Amplification must be finite and positive
  const coordinates = curveCoordinates(balances, rates)
  if (!coordinates) return undefined
  const { xp, scale, unit } = coordinates
  const d = invariant == null ? stableInvariant(xp, amplification) : invariant / unit
  if (!isPositiveFinite(d)) return undefined // Invariant must be finite and positive
  return {
    xp,
    scale,
    seed: Math.max(1 / amplification, MIN_RELATIVE_PRICE_WIDTH),
    solve: (state, outputCoin) => stableBalance(state, amplification, d, outputCoin),
  }
}
