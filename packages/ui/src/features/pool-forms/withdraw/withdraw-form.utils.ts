import type { Decimal } from '@primitives/decimal.utils'
import type { AllowUndefined } from '@ui/features/queries/util'
import type { PoolTokenFields } from '../pool-form.utils'

export type WithdrawMutation = {
  amounts: (Decimal | undefined)[]
  maxAmounts: (Decimal | undefined)[]
  isBalanced: boolean
  decimals: number[]
  lpAmount: Decimal
  maxLpAmount: Decimal
  slippage: Decimal
  supply: Decimal
  seedLock: Decimal
  maximumBurn: Decimal
  quote: Decimal
}

export type WithdrawFormValues = AllowUndefined<
  Omit<WithdrawMutation, 'amounts' | 'maxAmounts' | 'quote'>,
  'decimals' | 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock' | 'maximumBurn'
> &
  PoolTokenFields & { decimals: number[] | undefined }
