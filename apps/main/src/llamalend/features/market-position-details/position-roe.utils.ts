import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'
import {
  ZERO,
  decimal,
  decimalCompare,
  decimalDiv,
  decimalEqual,
  decimalGreaterThan,
  decimalMultiply,
} from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export type YieldInput = { aprFraction: Decimal } | { unavailable: true } | { unnecessary: true }

export type RewardInput = { amount: Decimal } | { unavailable: true } | { unnecessary: true }

export type RoeInput = {
  collateralValue: Decimal
  borrowedValue: Decimal
  debt: Decimal
  equity: Decimal
  /** Decimal APR fractions, not percentage points and not APY. */
  collateralYield: YieldInput
  borrowedYield: YieldInput
  borrowCost: YieldInput
  /** Separate annual rewards in borrowed-token value. Unknown rewards are unavailable, not zero. */
  rewards: RewardInput
}

export type RoeResult = { status: 'unavailable' } | { status: 'value'; aprPercent: Decimal; multiplier: RoeMultiplier }

export type RoeMultiplier =
  { kind: 'ratio'; value: Decimal } | { kind: 'zero' } | { kind: 'negative'; value: Decimal } | { kind: 'omit' }

const annual = (balance: Decimal, yieldInput: YieldInput): Decimal | undefined => {
  if ('unnecessary' in yieldInput) return ZERO
  if ('unavailable' in yieldInput) return undefined
  return decimalMultiply(balance, yieldInput.aprFraction)
}

/** Position ROE from current balances. Distinct from the table helper `getReturnOnEquity`, which uses APY and leverage. */
export const positionReturnOnEquity = ({
  collateralValue,
  borrowedValue,
  debt,
  equity,
  collateralYield,
  borrowedYield,
  borrowCost,
  rewards,
}: RoeInput): RoeResult => {
  if (!decimalGreaterThan(equity, ZERO)) return { status: 'unavailable' }
  const collateralAnnual = annual(
    collateralValue,
    decimalEqual(collateralValue, ZERO) ? { unnecessary: true } : collateralYield,
  )
  const borrowedAnnual = annual(
    borrowedValue,
    decimalEqual(borrowedValue, ZERO) ? { unnecessary: true } : borrowedYield,
  )
  const debtAnnual = annual(debt, decimalEqual(debt, ZERO) ? { unnecessary: true } : borrowCost)
  const rewardAnnual = 'amount' in rewards ? rewards.amount : 'unnecessary' in rewards ? ZERO : undefined
  if (
    collateralAnnual == undefined ||
    borrowedAnnual == undefined ||
    debtAnnual == undefined ||
    rewardAnnual == undefined
  ) {
    return { status: 'unavailable' }
  }
  const numerator = BigNumber(collateralAnnual).plus(borrowedAnnual).minus(debtAnnual).plus(rewardAnnual)
  const aprPercent = decimal(BigNumber(numerator).dividedBy(equity).multipliedBy(100).toFixed())
  if (aprPercent == undefined) return { status: 'unavailable' }
  return { status: 'value', aprPercent, multiplier: yieldMultiplier(aprPercent, collateralYield) }
}

export const yieldMultiplier = (roeAprPercent: Decimal, collateralYield: YieldInput): RoeMultiplier => {
  if (!('aprFraction' in collateralYield)) return { kind: 'omit' }
  const reference = decimalMultiply(collateralYield.aprFraction, decimal('100') ?? '100')
  if (decimalCompare(reference, ZERO) <= 0) return { kind: 'omit' }
  const ratio = decimalDiv(roeAprPercent, reference)
  if (ratio == undefined) return { kind: 'omit' }
  if (decimalCompare(roeAprPercent, ZERO) < 0) return { kind: 'negative', value: ratio }
  if (decimalEqual(roeAprPercent, ZERO)) return { kind: 'zero' }
  return { kind: 'ratio', value: ratio }
}

export const formatYieldMultiplier = (
  multiplier: RoeMultiplier,
  reference: 'yield' | 'collateral' = 'yield',
): string | undefined => {
  if (multiplier.kind === 'omit') return undefined
  if (multiplier.kind === 'zero') return reference === 'collateral' ? t`0× collateral yield` : t`0× yield`
  return reference === 'collateral'
    ? t`${BigNumber(multiplier.value).toFixed(4)}× collateral yield`
    : t`${BigNumber(multiplier.value).toFixed(4)}× yield`
}

type RebasingToken = { rebasingYieldApr: number | Nullish }

/** Lending snapshots name the debt token `borrowedToken`. Mint snapshots name it `stablecoinToken`. */
export const snapshotRebasingAprs = (
  snapshot: { collateralToken: RebasingToken } & (
    { borrowedToken: RebasingToken } | { stablecoinToken: RebasingToken }
  ),
) => ({
  collateralApr: snapshot.collateralToken.rebasingYieldApr,
  borrowedApr: ('borrowedToken' in snapshot ? snapshot.borrowedToken : snapshot.stablecoinToken).rebasingYieldApr,
})

type AprPoints = Decimal | number | Nullish

export const aprFraction = (percentagePoints: AprPoints): YieldInput => {
  if (percentagePoints == null) return { unavailable: true }
  const points = decimal(percentagePoints)
  const hundred = decimal('100')
  if (points == undefined || hundred == undefined) return { unavailable: true }
  const fraction = decimalDiv(points, hundred)
  return fraction == undefined ? { unavailable: true } : { aprFraction: fraction }
}

type BalanceRoeInput = {
  collateralValue: Decimal
  borrowedValue: Decimal
  debt: Decimal
  equity: Decimal
  collateralApr: AprPoints
  borrowedApr: AprPoints
  borrowApr: AprPoints
}

export type CardRoe = { status: 'hidden' } | RoeResult

/** Card and previews hide the metric when collateral is earning an unknown APR. A missing borrowed APR counts as zero. */
export const cardPositionRoe = ({
  collateralValue,
  borrowedValue,
  debt,
  equity,
  collateralApr,
  borrowedApr,
  borrowApr,
}: BalanceRoeInput): CardRoe => {
  if (borrowApr == null) return { status: 'unavailable' }
  if (collateralApr == null && decimalGreaterThan(collateralValue, ZERO)) return { status: 'hidden' }
  return positionReturnOnEquity({
    collateralValue,
    borrowedValue,
    debt,
    equity,
    collateralYield: aprFraction(collateralApr),
    borrowedYield: borrowedApr == null ? { unnecessary: true } : aprFraction(borrowedApr),
    borrowCost: aprFraction(borrowApr),
    rewards: { unnecessary: true },
  })
}

/** List rows surface a missing APR as unavailable instead of hiding the column. */
export const listedPositionRoe = ({
  collateralValue,
  borrowedValue,
  debt,
  equity,
  collateralApr,
  borrowedApr,
  borrowApr,
}: BalanceRoeInput): RoeResult =>
  positionReturnOnEquity({
    collateralValue,
    borrowedValue,
    debt,
    equity,
    collateralYield: aprFraction(collateralApr),
    borrowedYield: aprFraction(borrowedApr),
    borrowCost: aprFraction(borrowApr),
    rewards: { unnecessary: true },
  })
