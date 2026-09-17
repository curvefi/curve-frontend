import type { Decimal } from '@primitives/decimal.utils'
import type { MakeOptional } from '@ui/features/queries/util'
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

export type WithdrawFormValues = MakeOptional<
  Omit<WithdrawMutation, 'amounts' | 'maxAmounts'>,
  'decimals' | 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock' | 'maximumBurn' | 'quote'
> &
  PoolTokenFields & { decimals: number[] | undefined }
