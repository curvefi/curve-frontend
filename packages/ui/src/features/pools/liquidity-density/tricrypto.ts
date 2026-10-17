import { cryptoBalance, cryptoInvariant } from './cryptoswap'
import { curveCoordinates, isPositiveFinite } from './curve'
import type { LiquidityCurve } from './types'

/** A is divided by the family's multiplier (10,000 modern / 100 legacy); prices and D use whole units. */
export const createTriCryptoCurve = (
  balances: readonly number[],
  priceScales: readonly number[],
  amplification: number,
  gamma: number,
  invariant?: number,
  legacy = false,
): LiquidityCurve | undefined => {
  if (balances.length !== 3 || priceScales.length !== 2) return undefined // Tricrypto requires three balances
  if (!isPositiveFinite(amplification)) return undefined // Amplification must be finite and positive
  if (!isPositiveFinite(gamma)) return undefined // Gamma must be finite and positive
  const coordinates = curveCoordinates(balances, [1, ...priceScales])
  if (!coordinates) return undefined
  const { xp, scale, unit } = coordinates
  const d = invariant == null ? cryptoInvariant(xp, amplification, gamma) : invariant / unit
  if (!isPositiveFinite(d)) return undefined // Invariant must be finite and positive
  return {
    xp,
    scale,
    seed: Math.max((Math.sqrt(gamma) * 27) / amplification, 2e-4),
    solve: (state, outputCoin) => {
      // electric-router/src/erouter/core/tricrypto.py: newton_y_fast.
      const others = state.filter((_, index) => index !== outputCoin).toSorted((a, b) => b - a)
      if (!others.every(isPositiveFinite)) return undefined // Input balance must be finite and positive
      if (legacy && others.some(value => !(0.01 <= value / d && value / d <= 100))) {
        return undefined // Tricrypto input balance is outside its domain
      }
      const [larger, smaller] = others
      const yAfterSmaller = ((d / 3) * d) / (smaller * 3)
      const initialY = (yAfterSmaller * d) / (larger * 3)
      const k0Other = (((larger * 3) / d) * smaller * 3) / d
      const y = cryptoBalance({
        initialY,
        otherSum: larger + smaller,
        otherK0: k0Other,
        coinCount: 3,
        amplification,
        gamma,
        invariant: d,
      })
      if (y == null) return undefined
      if (!(0.01 < y / d && y / d < 100)) return undefined // Tricrypto output balance is outside its domain
      return y
    },
  }
}
