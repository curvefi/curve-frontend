import { MAX_CRYPTO_BALANCE_RATIO, MIN_CRYPTO_BALANCE_RATIO, MIN_RELATIVE_PRICE_WIDTH } from './constants'
import { cryptoBalance, cryptoInvariant } from './cryptoswap'
import { curveCoordinates, isPositiveFinite } from './curve'
import type { LiquidityCurve } from './types'

const COIN_COUNT = 3
const COIN_COUNT_POWER = COIN_COUNT ** COIN_COUNT

/** A is divided by the family's multiplier (10,000 modern / 100 legacy); prices and D use whole units. */
export const createTriCryptoCurve = (
  balances: readonly number[],
  priceScales: readonly number[],
  amplification: number,
  gamma: number,
  invariant?: number,
  legacy = false,
): LiquidityCurve | undefined => {
  if (balances.length !== COIN_COUNT || priceScales.length !== COIN_COUNT - 1) return undefined // Tricrypto requires three balances
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
    seed: Math.max((Math.sqrt(gamma) * COIN_COUNT_POWER) / amplification, MIN_RELATIVE_PRICE_WIDTH),
    solve: (state, outputCoin) => {
      // electric-router/src/erouter/core/tricrypto.py: newton_y_fast.
      const others = state.filter((_, index) => index !== outputCoin).toSorted((a, b) => b - a)
      if (!others.every(isPositiveFinite)) return undefined // Input balance must be finite and positive
      if (
        legacy &&
        others.some(value => !(MIN_CRYPTO_BALANCE_RATIO <= value / d && value / d <= MAX_CRYPTO_BALANCE_RATIO))
      ) {
        return undefined // Tricrypto input balance is outside its domain
      }
      const [larger, smaller] = others
      const yAfterSmaller = ((d / COIN_COUNT) * d) / (smaller * COIN_COUNT)
      const initialY = (yAfterSmaller * d) / (larger * COIN_COUNT)
      const k0Other = (((larger * COIN_COUNT) / d) * smaller * COIN_COUNT) / d
      const y = cryptoBalance({
        initialY,
        otherSum: larger + smaller,
        otherK0: k0Other,
        coinCount: COIN_COUNT,
        amplification,
        gamma,
        invariant: d,
      })
      if (y == null) return undefined
      if (!(MIN_CRYPTO_BALANCE_RATIO < y / d && y / d < MAX_CRYPTO_BALANCE_RATIO)) return undefined // Tricrypto output balance is outside its domain
      return y
    },
  }
}
