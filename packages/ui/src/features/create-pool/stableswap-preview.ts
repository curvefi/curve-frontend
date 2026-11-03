import { maybe, maybes, notFalsy, range } from '@primitives/objects.utils'
import { balanceAtPrice, spotPrice } from '@ui/features/pools/liquidity-density/curve'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import type { LiquidityCurve } from '@ui/features/pools/liquidity-density/types'

export const STABLESWAP_PREVIEW_PAIR = [0, 1] as const
export const STABLESWAP_PREVIEW_PRICE_BAND = 0.005

// The first pair moves along the invariant; all other reserves stay at one.
const pointAt = (curve: LiquidityCurve, x: number) => {
  const xp = curve.xp.map((balance, index) => (index === 0 ? x : balance))
  return maybes([curve.solve(xp, 1), spotPrice({ ...curve, xp }, STABLESWAP_PREVIEW_PAIR)], (y, price) => ({
    share: (100 * x) / (x + y),
    price,
    // x*y=k gives marginal price y/x at the same reserve share.
    constantProductPrice: y / x,
  }))
}

export const stableswapPreview = (amplification: number, tokenCount: number) => {
  const balances = range(tokenCount).map(() => 1)
  return maybe(createStableSwapCurve(balances, balances, amplification), curve => ({
    samples: range(399).flatMap(index => {
      const point = pointAt(curve, (index + 1) / 200)
      return notFalsy(point)
    }),
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
