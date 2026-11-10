import { maybe, maybes, notFalsy, range } from '@primitives/objects.utils'
import { balanceAtPrice, spotPrice } from '@ui/features/pools/liquidity-density/curve'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import type { LiquidityCurve } from '@ui/features/pools/liquidity-density/types'

export const STABLESWAP_PREVIEW_PAIR = [0, 1] as const
export const STABLESWAP_PREVIEW_PRICE_BAND = 0.005

// Each reserve starts at 1. Sample x in (0, 2) in 0.5% steps, including x = 1 and avoiding a zero reserve.
const MAX_SAMPLED_BALANCE = 2
const SAMPLES_PER_BALANCE_UNIT = 200

// The first pair moves along the invariant; all other reserves stay at one.
const pointAt = (curve: LiquidityCurve, x: number) => {
  const xp = curve.xp.map((balance, index) => (index === 0 ? x : balance))
  return maybes([curve.solve(xp, 1), spotPrice({ ...curve, xp }, STABLESWAP_PREVIEW_PAIR)], (y, price) => ({
    share: (100 * x) / (x + y),
    price,
    constantProductPrice: y / x, // x*y=k gives marginal price y/x at the same reserve share.
  }))
}

export const stableswapPreview = (amplification: number, tokenCount: number) => {
  const balances = range(tokenCount).map(() => 1)
  return maybe(createStableSwapCurve(balances, balances, amplification), curve => ({
    samples: range(MAX_SAMPLED_BALANCE * SAMPLES_PER_BALANCE_UNIT - 1).flatMap(index =>
      notFalsy(pointAt(curve, (index + 1) / SAMPLES_PER_BALANCE_UNIT)),
    ),
    band: maybes(
      [
        balanceAtPrice(curve, STABLESWAP_PREVIEW_PAIR, 1 + STABLESWAP_PREVIEW_PRICE_BAND),
        balanceAtPrice(curve, STABLESWAP_PREVIEW_PAIR, 1 - STABLESWAP_PREVIEW_PRICE_BAND),
      ],
      (low, high) =>
        maybes([pointAt(curve, low), pointAt(curve, high)], (low, high) => [low.share, high.share] as const),
    ),
  }))
}
