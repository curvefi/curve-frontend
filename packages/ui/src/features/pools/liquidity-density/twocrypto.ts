import { cryptoBalance, cryptoInvariant } from './cryptoswap'
import { curveCoordinates, isPositiveFinite } from './curve'
import type { LiquidityCurve } from './types'

/** A is divided by 10,000; gamma, priceScale and D are divided by 1e18 by the caller. */
export const createTwoCryptoCurve = (
  balances: readonly number[],
  priceScale: number,
  amplification: number,
  gamma: number,
  invariant?: number,
  legacy = false,
): LiquidityCurve | undefined => {
  if (balances.length !== 2) return undefined // Twocrypto requires two balances
  if (!isPositiveFinite(amplification)) return undefined // Amplification must be finite and positive
  if (!isPositiveFinite(gamma)) return undefined // Gamma must be finite and positive
  const coordinates = curveCoordinates(balances, [1, priceScale])
  if (!coordinates) return undefined
  const { xp, scale, unit } = coordinates
  const d = invariant == null ? cryptoInvariant(xp, amplification, gamma) : invariant / unit
  if (!isPositiveFinite(d)) return undefined // Invariant must be finite and positive
  return {
    xp,
    scale,
    seed: Math.max((Math.sqrt(gamma) * 4) / amplification, 2e-4),
    solve: (state, outputCoin) => {
      // electric-router/src/erouter/core/cryptoswap.py: newton_y_fast; twocrypto.py: _y_fast.
      const other = state[1 - outputCoin]
      if (!isPositiveFinite(other)) return undefined // Input balance must be finite and positive
      const k0Other = (2 * other) / d
      const limit = legacy || gamma <= 0.02 ? 100 : (100 * 0.02) / gamma
      const inDomain = legacy ? 0.02 < k0Other && k0Other < 200 : 1 / limit <= k0Other && k0Other <= limit
      if (!inDomain) return undefined // Twocrypto input balance is outside its domain
      const y = cryptoBalance({
        initialY: (d * d) / (other * 4),
        otherSum: other,
        otherK0: k0Other,
        coinCount: 2,
        amplification,
        gamma,
        invariant: d,
      })
      if (y == null) return undefined
      if (legacy && !(0.01 < y / d && y / d < 100)) {
        return undefined // Twocrypto output balance is outside its domain
      }
      return y
    },
  }
}
