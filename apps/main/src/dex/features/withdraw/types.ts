import type { PoolQuery, UserQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export type WithdrawMutation = {
  amounts: Decimal[]
  decimals: number[]
  isWrapped: boolean
  isBalanced: boolean
  lpAmount: Decimal
  maxLpAmount: Decimal
  maxWithdrawIndex: number | undefined
  slippage: Decimal
}

export type WithdrawQuery = PoolQuery & WithdrawMutation
export type UserWithdrawQuery = WithdrawQuery & UserQuery
export type WithdrawParams = FieldsOf<WithdrawQuery>
export type UserWithdrawParams = FieldsOf<UserWithdrawQuery>

export type WithdrawLpQuery = PoolQuery & { isWrapped: boolean; lpAmount: Decimal }
export type WithdrawLpParams = FieldsOf<WithdrawLpQuery>
export type WithdrawMaxQuery = WithdrawLpQuery & { index: number }
export type WithdrawMaxParams = FieldsOf<WithdrawMaxQuery>
