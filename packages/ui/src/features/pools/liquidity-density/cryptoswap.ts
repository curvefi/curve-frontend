import { sum } from 'lodash'
import { maybe, range } from '@primitives/objects.utils'
import { isPositiveFinite, SOLVER_ITERATIONS, SOLVER_TOLERANCE } from './curve'
import { converge, iterate, product } from './math'

const solverSteps = range(SOLVER_ITERATIONS)
const bracketSteps = range(SOLVER_ITERATIONS + 1)

// Floating-point Newton iteration from electric-router/src/erouter/core/cryptoswap.py and tricrypto.py,
// commit 282fa4c8fd838c99f80c3c5fae26fbca9b8747cc. The family-specific starting points and
// domain checks live in twocrypto.ts/tricrypto.ts; both sources use this same iteration.
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
}): number | undefined => {
  if (!isPositiveFinite(amplification)) return undefined // Amplification must be finite and positive
  if (!isPositiveFinite(gamma)) return undefined // Gamma must be finite and positive
  if (!isPositiveFinite(invariant)) return undefined // Invariant must be finite and positive
  return converge(
    initialY,
    solverSteps,
    y => {
      if (!isPositiveFinite(y)) return undefined // Output balance must be finite and positive
      const k0 = (otherK0 * y * coinCount) / invariant
      if (!isPositiveFinite(k0)) return undefined // K0 must be finite and positive
      const total = otherSum + y
      const gap = Math.abs(gamma + 1 - k0)
      if (!isPositiveFinite(gap)) return undefined // Distance from invariant pole must be finite and positive
      const mul1 = (invariant * gap * gap) / (gamma * gamma * amplification)
      const mul2 = 1 + (2 * k0) / gap
      const yDerivative = y + total * mul2 + mul1
      const dDerivative = invariant * mul2
      if (yDerivative < dDerivative) return y / 2
      const difference = yDerivative - dDerivative
      const derivative = difference / y
      if (!isPositiveFinite(derivative)) return undefined // Derivative must be finite and positive
      const minus = mul1 / derivative
      const plus = (difference + invariant) / derivative + minus / k0
      const correction = minus + total / derivative
      const next = plus < correction ? y / 2 : plus - correction
      return isPositiveFinite(next) ? next : undefined // Output balance must be finite and positive
    },
    (next, previous) => Math.abs(next - previous) < SOLVER_TOLERANCE * next,
  ) // CryptoSwap output balance did not converge if undefined
}

/** Fallback for pools without D(). Prefer the stored value whenever the pool exposes it. */
export const cryptoInvariant = (
  balances: readonly number[],
  amplification: number,
  gamma: number,
): number | undefined => {
  // flet-curve-demo/src/curve/liquidity.py: crypto_invariant. Coordinates are already order-one.
  const { length: n } = balances
  if (!balances.every(isPositiveFinite)) return undefined // Balance must be finite and positive
  const total = sum(balances)
  const balanceProduct = product(balances)
  if (!isPositiveFinite(amplification)) return undefined // Amplification must be finite and positive
  if (!isPositiveFinite(gamma)) return undefined // Gamma must be finite and positive
  const residual = (d: number) => {
    const k0 = (balanceProduct * n ** n) / d ** n
    const gap = gamma + 1 - k0
    if (gap === 0) return undefined // Invariant is singular
    // Unlike the demo's residual, account for the router's ANN convention:
    // amplification is A * N**N, while the invariant's K coefficient uses A.
    const k = ((amplification / n ** n) * k0 * gamma * gamma) / (gap * gap)
    const value = k * d ** (n - 1) * total + balanceProduct - k * d ** n - (d / n) ** n
    if (!Number.isFinite(value)) return undefined // Invariant is outside the numerical range
    return value
  }
  const lower = bracketSteps
    .map(step => total / n / 2 ** step)
    .find(d => {
      const value = residual(d)
      return value == null || value > 0
    })
  const upper = bracketSteps
    .map(step => total * n * 2 ** step)
    .find(d => {
      const value = residual(d)
      return value == null || value < 0
    })
  if (lower == null || upper == null) return undefined // Could not bracket the invariant
  const lowValue = residual(lower)
  const highValue = residual(upper)
  if (lowValue == null || highValue == null || lowValue <= 0 || highValue >= 0) {
    return undefined // Could not bracket the invariant
  }
  const bounds = iterate<readonly [number, number] | undefined>(
    [lower, upper],
    solverSteps,
    ([low, high]) => {
      const middle = (low + high) / 2
      return maybe(residual(middle), (value): readonly [number, number] => (value > 0 ? [middle, high] : [low, middle]))
    },
    ([low, high]) => high - low <= high * 1e-9,
  )
  return maybe(bounds, ([low, high]) => (high - low <= high * 1e-9 ? (low + high) / 2 : undefined)) // CryptoSwap invariant did not converge if undefined
}
