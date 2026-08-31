import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { UserChainQuery } from '@evm-ui/lib/model'
import type { Decimal } from '@primitives/decimal.utils'

export type WithdrawLockFormValues = Record<string, never>

export type WithdrawLockQuery = UserChainQuery<ChainId> & {
  lockedAmount: Decimal
  /** Unix timestamp in milliseconds. */
  unlockTime: number
}

export type WithdrawLockParams = FieldsOf<WithdrawLockQuery>

export type WithdrawLockMutation = WithdrawLockFormValues
