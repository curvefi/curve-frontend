import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { ZERO, decimal, decimalCompare, decimalDiv, decimalEqual, decimalGreaterThan, decimalMultiply } from '@ui/lib/decimal'

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

export type RoeResult =
  | { status: 'unavailable' }
  | { status: 'value'; aprPercent: Decimal; multiplier: RoeMultiplier }

export type RoeMultiplier =
  | { kind: 'ratio'; value: Decimal }
  | { kind: 'zero' }
  | { kind: 'negative' }
  | { kind: 'omit' }

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
  const collateralAnnual = annual(collateralValue, decimalEqual(collateralValue, ZERO) ? { unnecessary: true } : collateralYield)
  const borrowedAnnual = annual(borrowedValue, decimalEqual(borrowedValue, ZERO) ? { unnecessary: true } : borrowedYield)
  const debtAnnual = annual(debt, decimalEqual(debt, ZERO) ? { unnecessary: true } : borrowCost)
  const rewardAnnual = 'amount' in rewards ? rewards.amount : 'unnecessary' in rewards ? ZERO : undefined
  if (collateralAnnual == undefined || borrowedAnnual == undefined || debtAnnual == undefined || rewardAnnual == undefined) {
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
  if (decimalCompare(roeAprPercent, ZERO) < 0) return { kind: 'negative' }
  if (decimalEqual(roeAprPercent, ZERO)) return { kind: 'zero' }
  return { kind: 'ratio', value: decimalDiv(roeAprPercent, reference) }
}

export const formatYieldMultiplier = (multiplier: RoeMultiplier): string | undefined => {
  if (multiplier.kind === 'omit') return undefined
  if (multiplier.kind === 'negative') return 'Net yield negative'
  if (multiplier.kind === 'zero') return '0× collateral yield'
  return `${BigNumber(multiplier.value).toFixed(4)}× collateral yield`
}
