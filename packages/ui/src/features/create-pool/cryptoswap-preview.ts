import { maybe, range } from '@primitives/objects.utils'
import { SOLVER_TOLERANCE } from '@ui/features/pools/liquidity-density/constants'
import { iterate } from '@ui/features/pools/liquidity-density/math'

const A_PRECISION = 10_000
const SAMPLES_PER_SIDE = 96
const WINDOW_HALF_WIDTHS = 5
const MAX_PRICE_DROP = 2 / 3 // Mirroring prices gives a window from 1/3 to 3.
const searchSteps = range(64)

/** Depth at imbalance = 1 - x*y, with D=N and all other reserves fixed at 1. */
const depthAt = (imbalance: number, amplification: number, gamma: number, tokenCount: number) => {
  const coefficient = amplification / tokenCount // Unscaled ANN becomes ANN/N in the normalized pair invariant.
  const ratio = imbalance / gamma
  const denominator = coefficient * (1 - imbalance)
  // The invariant gives x+y = 2 + imbalance*(1+imbalance/gamma)²/[coefficient*(1-imbalance)].
  const sumExcess = (imbalance * (1 + ratio) ** 2) / denominator
  // Both derivatives are with respect to imbalance.
  const sumDerivative = ((1 + ratio) * (1 + 3 * ratio) + coefficient * sumExcess) / denominator
  const sumSecondDerivative = ((4 + 6 * ratio) / gamma + 2 * coefficient * sumDerivative) / denominator
  // Expand (x-y)² = (x+y)² - 4xy to preserve precision near x=y.
  const balanceDifference = Math.sqrt(sumExcess ** 2 + 4 * (sumExcess + imbalance))
  const inputBalance = 1 + (sumExcess + balanceDifference) / 2

  // Differentiate the invariant directly; finite differences lose precision near narrow peaks.
  const priceDenominator = 1 + sumDerivative * inputBalance
  const priceDrop = (sumDerivative * balanceDifference) / priceDenominator
  const price = 1 - priceDrop
  // |dp/dx| converts to reserve depth per unit log-price movement as p/|dp/dx|.
  const priceSlope =
    (sumSecondDerivative * (balanceDifference / priceDenominator) ** 2 + 2 * price * sumDerivative) / priceDenominator
  const poolDepth = price / priceSlope
  const constantProductDepth = tokenCount / (4 * Math.sqrt(price)) // Same total deposit, split across two reserves.
  return { priceDrop, depth: poolDepth / constantProductDepth }
}

/** A uses the contract's 10,000 precision; gamma is unscaled. Reserves start at equal value. */
export const cryptoswapPreview = (amplification: number, gamma: number, tokenCount: 2 | 3) => {
  if (![amplification, gamma].every(value => Number.isFinite(value) && value > 0)) return
  const pointAt = (imbalance: number) => depthAt(imbalance, amplification / A_PRECISION, gamma, tokenCount)
  // Bisect from balance (imbalance=0) toward depleted reserves (xy=0, imbalance=1).
  const findImbalance = (before: (point: ReturnType<typeof pointAt>) => boolean) =>
    iterate<readonly [number, number]>(
      [0, 1],
      searchSteps,
      ([low, high]) => {
        const middle = (low + high) / 2
        return before(pointAt(middle)) ? [middle, high] : [low, middle]
      },
      ([low, high]) => high - low <= high * SOLVER_TOLERANCE,
    )[1]
  const depth = pointAt(0).depth
  // Half-height applies to excess depth above the 1× Uniswap v2 baseline.
  const halfDepth = 1 + (depth - 1) / 2
  const bandDrop = depth > 1 ? pointAt(findImbalance(point => point.depth > halfDepth)).priceDrop : undefined
  // Expand the band in log-price space; log1p/expm1 retain precision for very narrow ranges.
  const windowDrop = Math.min(
    MAX_PRICE_DROP,
    maybe(bandDrop, drop => -Math.expm1(WINDOW_HALF_WIDTHS * Math.log1p(-drop))) ?? MAX_PRICE_DROP,
  )
  const maxImbalance = findImbalance(point => point.priceDrop < windowDrop)
  // Price moves like sqrt(imbalance) near balance; squared steps resolve the peak and include its exact center.
  const points = range(SAMPLES_PER_SIDE + 1).map(index => pointAt(maxImbalance * (index / SAMPLES_PER_SIDE) ** 2))
  return {
    samples: [
      ...points.toReversed().map(({ priceDrop, depth }) => ({ deviation: -100 * priceDrop, depth })),
      // Swapping reserves sends price to 1/price and preserves relative depth; skip the duplicate center.
      ...points.slice(1).map(({ priceDrop, depth }) => ({ deviation: (100 * priceDrop) / (1 - priceDrop), depth })),
    ],
    depth,
    band: maybe(bandDrop, drop => [-100 * drop, (100 * drop) / (1 - drop)] as const),
  }
}
