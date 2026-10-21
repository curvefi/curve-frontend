import type { Amount } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { createCryptoCurve, cryptoNewtonY, isCryptoBalanceInDomain } from './cryptoswap'
import type { LiquidityCurve } from './types'

const COIN_COUNT = 2
const COIN_COUNT_POWER = COIN_COUNT ** COIN_COUNT
// Modern math tightens the K0 domain above this gamma; legacy math bounds balances / D directly.
const K0_GAMMA_THRESHOLD = 0.02
const MAX_K0_RATIO = 100

/** A is divided by 10,000; gamma, priceScale and D are divided by 1e18 by the caller. */
export const createTwoCryptoCurve = (
  balances: readonly Amount[],
  priceScale: Amount,
  amplification: number,
  gamma: number,
  invariant?: Amount,
  { legacy = false } = {},
): LiquidityCurve | undefined =>
  createCryptoCurve(balances, [1, priceScale], amplification, gamma, {
    invariant,
    /** Solve the other reserve using electric-router's cryptoswap.newton_y_fast / twocrypto._y_fast. */
    solve: (state, outputCoin, d) => {
      const other = state[1 - outputCoin]
      const k0Other = (COIN_COUNT * other) / d
      const limit = legacy || gamma <= K0_GAMMA_THRESHOLD ? MAX_K0_RATIO : (MAX_K0_RATIO * K0_GAMMA_THRESHOLD) / gamma
      const inDomain = legacy ? isCryptoBalanceInDomain(other, d) : 1 / limit <= k0Other && k0Other <= limit
      return inDomain
        ? maybe(
            cryptoNewtonY({
              initialY: (d * d) / (other * COIN_COUNT_POWER),
              otherSum: other,
              otherK0: k0Other,
              coinCount: COIN_COUNT,
              amplification,
              gamma,
              invariant: d,
            }),
            y => (legacy && !isCryptoBalanceInDomain(y, d) ? undefined : y),
          )
        : undefined // Twocrypto input balance is outside its domain
    },
  })
