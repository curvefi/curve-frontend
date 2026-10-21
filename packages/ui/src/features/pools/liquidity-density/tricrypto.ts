import type { Amount } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { createCryptoCurve, cryptoNewtonY, isCryptoBalanceInDomain } from './cryptoswap'
import type { LiquidityCurve } from './types'

const COIN_COUNT = 3

/** A is divided by the family's multiplier (10,000 modern / 100 legacy); prices and D use whole units. */
export const createTriCryptoCurve = (
  balances: readonly Amount[],
  priceScales: readonly Amount[],
  amplification: number,
  gamma: number,
  invariant?: Amount,
  { legacy = false } = {},
): LiquidityCurve | undefined =>
  createCryptoCurve(balances, [1, ...priceScales], amplification, gamma, {
    invariant,
    /** Hold the other two reserves fixed and solve the third with electric-router's tricrypto.newton_y_fast. */
    solve: (state, outputCoin, d) => {
      const others = state.filter((_, index) => index !== outputCoin).toSorted((a, b) => b - a)
      if (legacy && !others.every(value => isCryptoBalanceInDomain(value, d, { inclusive: true }))) {
        return // Tricrypto input balance is outside its domain
      }
      const [larger, smaller] = others
      const yAfterSmaller = ((d / COIN_COUNT) * d) / (smaller * COIN_COUNT)
      const initialY = (yAfterSmaller * d) / (larger * COIN_COUNT)
      const k0Other = (((larger * COIN_COUNT) / d) * smaller * COIN_COUNT) / d

      return maybe(
        cryptoNewtonY({
          initialY,
          otherSum: larger + smaller,
          otherK0: k0Other,
          coinCount: COIN_COUNT,
          amplification,
          gamma,
          invariant: d,
        }),
        y => (isCryptoBalanceInDomain(y, d) ? y : undefined),
      )
    },
  })
