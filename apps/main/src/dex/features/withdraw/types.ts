import type { PoolQuery, UserQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import type { WithdrawMode } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type WithdrawMutation = {
  amounts: Decimal[]
  decimals: number[]
  isWrapped: boolean
  maxLpAmount: Decimal
  slippage: Decimal
} & (
  | { mode: 'balanced'; lpAmount: Decimal }
  | { mode: 'unbalanced' }
  | { mode: 'one-coin'; lpAmount: Decimal; tokenIndex: number }
)

export type WithdrawQuery = PoolQuery & WithdrawMutation
export type UserWithdrawQuery = WithdrawQuery & UserQuery
export type WithdrawParams = FieldsOf<DeepPartial<WithdrawQuery>>
export type UserWithdrawParams = FieldsOf<DeepPartial<UserWithdrawQuery>>
export type WithdrawQuoteParams = UserWithdrawParams &
  PoolQuery & { mode: WithdrawMode; slippage: Decimal; isWrapped: boolean }

export type WithdrawLpQuery = PoolQuery & { isWrapped: boolean; lpAmount: Decimal }
export type WithdrawLpParams = FieldsOf<WithdrawLpQuery>
export type WithdrawMaxQuery = WithdrawLpQuery & { index: number }
export type WithdrawMaxParams = FieldsOf<WithdrawMaxQuery>
