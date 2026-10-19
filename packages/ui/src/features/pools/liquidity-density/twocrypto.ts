import { MAX_CRYPTO_BALANCE_RATIO, MIN_CRYPTO_BALANCE_RATIO, MIN_RELATIVE_PRICE_WIDTH } from './constants'
import { cryptoBalance, cryptoInvariant } from './cryptoswap'
import { curveCoordinates, isPositiveFinite } from './curve'
import type { LiquidityCurve } from './types'

const COIN_COUNT = 2
const COIN_COUNT_POWER = COIN_COUNT ** COIN_COUNT
// Modern math tightens the K0 domain above this gamma; legacy math bounds balances / D directly.
const K0_GAMMA_THRESHOLD = 0.02
const MAX_K0_RATIO = 100
const MIN_LEGACY_K0_RATIO = COIN_COUNT * MIN_CRYPTO_BALANCE_RATIO
const MAX_LEGACY_K0_RATIO = COIN_COUNT * MAX_CRYPTO_BALANCE_RATIO

/** A is divided by 10,000; gamma, priceScale and D are divided by 1e18 by the caller. */
export const createTwoCryptoCurve = (
  balances: readonly number[],
  priceScale: number,
  amplification: number,
  gamma: number,
  invariant?: number,
  legacy = false,
): LiquidityCurve | undefined => {
  if (balances.length !== COIN_COUNT) return undefined // Twocrypto requires two balances
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
    seed: Math.max((Math.sqrt(gamma) * COIN_COUNT_POWER) / amplification, MIN_RELATIVE_PRICE_WIDTH),
    solve: (state, outputCoin) => {
      // electric-router/src/erouter/core/cryptoswap.py: newton_y_fast; twocrypto.py: _y_fast.
      const other = state[1 - outputCoin]
      if (!isPositiveFinite(other)) return undefined // Input balance must be finite and positive
      const k0Other = (COIN_COUNT * other) / d
      const limit = legacy || gamma <= K0_GAMMA_THRESHOLD ? MAX_K0_RATIO : (MAX_K0_RATIO * K0_GAMMA_THRESHOLD) / gamma
      const inDomain = legacy
        ? MIN_LEGACY_K0_RATIO < k0Other && k0Other < MAX_LEGACY_K0_RATIO
        : 1 / limit <= k0Other && k0Other <= limit
      if (!inDomain) return undefined // Twocrypto input balance is outside its domain
      const y = cryptoBalance({
        initialY: (d * d) / (other * COIN_COUNT_POWER),
        otherSum: other,
        otherK0: k0Other,
        coinCount: COIN_COUNT,
        amplification,
        gamma,
        invariant: d,
      })
      if (y == null) return undefined
      if (legacy && !(MIN_CRYPTO_BALANCE_RATIO < y / d && y / d < MAX_CRYPTO_BALANCE_RATIO)) {
        return undefined // Twocrypto output balance is outside its domain
      }
      return y
    },
  }
}
