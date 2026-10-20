import { sum } from 'lodash'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, maybes, range } from '@primitives/objects.utils'
import { decimalDiv } from '@ui/lib/decimal'
import {
  MAX_CRYPTO_BALANCE_RATIO,
  MIN_CRYPTO_BALANCE_RATIO,
  MIN_RELATIVE_PRICE_WIDTH,
  SOLVER_ITERATIONS,
  SOLVER_TOLERANCE,
} from './constants'
import { curveCoordinates } from './curve'
import { converge, iterate, product } from './math'
import type { LiquidityCurve } from './types'

const INVARIANT_SEARCH_TOLERANCE = 1e-9
const INVARIANT_BRACKET_GROWTH_FACTOR = 2
const solverSteps = range(SOLVER_ITERATIONS)
const bracketSteps = range(SOLVER_ITERATIONS + 1)

/** Solve an output balance with the Newton iteration shared by electric-router's cryptoswap.py/tricrypto.py.
 * Reference commit: 282fa4c8fd838c99f80c3c5fae26fbca9b8747cc. */
export const cryptoBalance = ({
  initialY,
  otherSum,
  otherK0,
  coinCount,
  amplification,
  gamma,
  invariant,
}: {
  initialY: number
  otherSum: number
  otherK0: number
  coinCount: number
  amplification: number
  gamma: number
  invariant: number
}): number | undefined =>
  converge(
    initialY,
    solverSteps,
    y => {
      const k0 = (otherK0 * y * coinCount) / invariant
      const total = otherSum + y
      const gap = Math.abs(gamma + 1 - k0)
      if (!gap) return undefined // The invariant has a pole at K0 = gamma + 1.
      const mul1 = (invariant * gap * gap) / (gamma * gamma * amplification)
      const mul2 = 1 + (2 * k0) / gap
      const yDerivative = y + total * mul2 + mul1
      const dDerivative = invariant * mul2
      if (yDerivative < dDerivative) return y / 2
      const difference = yDerivative - dDerivative
      const derivative = difference / y
      if (!derivative) return undefined // Newton's step cannot divide by a zero derivative.
      const minus = mul1 / derivative
      const plus = (difference + invariant) / derivative + minus / k0
      const correction = minus + total / derivative
      const next = plus < correction ? y / 2 : plus - correction
      return next > 0 ? next : undefined
    },
    (next, previous) => Math.abs(next - previous) < SOLVER_TOLERANCE * next,
  ) // CryptoSwap output balance did not converge if undefined

/** Fallback for pools without D(). Prefer the stored value whenever the pool exposes it. */
export const cryptoInvariant = (
  balances: readonly number[],
  amplification: number,
  gamma: number,
): number | undefined => {
  // flet-curve-demo/src/curve/liquidity.py: crypto_invariant. Coordinates are already order-one.
  const { length: n } = balances
  const total = sum(balances)
  const balanceProduct = product(balances)
  /** Evaluate the CryptoSwap invariant equation; its zero gives D (flet-curve-demo's crypto_invariant). */
  const residual = (d: number) => {
    const k0 = (balanceProduct * n ** n) / d ** n
    const gap = gamma + 1 - k0
    if (gap === 0) return undefined // Invariant is singular
    // Unlike the demo's residual, account for the router's ANN convention:
    // amplification is A * N**N, while the invariant's K coefficient uses A.
    const k = ((amplification / n ** n) * k0 * gamma * gamma) / (gap * gap)
    return k * d ** (n - 1) * total + balanceProduct - k * d ** n - (d / n) ** n
  }
  const lower = bracketSteps
    .map(step => total / n / INVARIANT_BRACKET_GROWTH_FACTOR ** step)
    .find(d => maybe(residual(d), value => value > 0) ?? true)
  const upper = bracketSteps
    .map(step => total * n * INVARIANT_BRACKET_GROWTH_FACTOR ** step)
    .find(d => maybe(residual(d), value => value < 0) ?? true)
  return maybes([lower, upper], (lower, upper) =>
    maybes([residual(lower), residual(upper)], (lowValue, highValue) => {
      if (lowValue <= 0 || highValue >= 0) {
        return undefined // Could not bracket the invariant
      }
      const bounds = iterate<readonly [number, number] | undefined>(
        [lower, upper],
        solverSteps,
        ([low, high]) => {
          const middle = (low + high) / 2
          return maybe(residual(middle), (value): readonly [number, number] =>
            value > 0 ? [middle, high] : [low, middle],
          )
        },
        ([low, high]) => high - low <= high * INVARIANT_SEARCH_TOLERANCE,
      )
      return maybe(bounds, ([low, high]) =>
        high - low <= high * INVARIANT_SEARCH_TOLERANCE ? (low + high) / 2 : undefined,
      ) // CryptoSwap invariant did not converge if undefined
    }),
  )
}

/** Legacy input bounds are inclusive for Tricrypto; output balances use strict bounds. */
export const isCryptoBalanceInDomain = (balance: number, invariant: number, { inclusive = false } = {}) => {
  const ratio = balance / invariant
  return inclusive
    ? MIN_CRYPTO_BALANCE_RATIO <= ratio && ratio <= MAX_CRYPTO_BALANCE_RATIO
    : MIN_CRYPTO_BALANCE_RATIO < ratio && ratio < MAX_CRYPTO_BALANCE_RATIO
}

/** Normalize CryptoSwap coordinates and reuse its invariant and peak-width seed across math variants. */
export const createCryptoCurve = (
  balances: readonly Amount[],
  rates: readonly Amount[],
  amplification: number,
  gamma: number,
  {
    invariant,
    solve,
  }: {
    invariant?: Amount
    solve: (balances: readonly number[], outputCoin: number, invariant: number) => number | undefined
  },
): LiquidityCurve | undefined =>
  maybe(curveCoordinates(balances, rates), ({ xp, scale, unit }) =>
    maybe(maybe(invariant, d => +decimalDiv(`${d}`, unit)) ?? cryptoInvariant(xp, amplification, gamma), d => ({
      xp,
      scale,
      seed: Math.max((Math.sqrt(gamma) * balances.length ** balances.length) / amplification, MIN_RELATIVE_PRICE_WIDTH),
      solve: (state, outputCoin) => solve(state, outputCoin, d),
    })),
  )
