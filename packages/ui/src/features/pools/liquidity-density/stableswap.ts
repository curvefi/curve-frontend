import { sum } from 'lodash'
import { maybe, range } from '@primitives/objects.utils'
import { MIN_RELATIVE_PRICE_WIDTH, SOLVER_ITERATIONS, SOLVER_TOLERANCE } from './constants'
import { curveCoordinates } from './curve'
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
      return next > 0 ? next : undefined
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
  const denominators = others.map(balance => balance * n)
  const c = (productOfRatios(d, d, denominators) * d) / (ann * n)
  const b = sum(others) + d / ann
  return converge(
    d,
    solverSteps,
    y => {
      const next = (y * y + c) / (2 * y + b - d)
      return next > 0 ? next : undefined
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
): LiquidityCurve | undefined =>
  maybe(curveCoordinates(balances, rates), ({ xp, scale, unit }) =>
    maybe(maybe(invariant, d => d / unit) ?? stableInvariant(xp, amplification), d => ({
      xp,
      scale,
      seed: Math.max(1 / amplification, MIN_RELATIVE_PRICE_WIDTH),
      solve: (state, outputCoin) => stableBalance(state, amplification, d, outputCoin),
    })),
  )
