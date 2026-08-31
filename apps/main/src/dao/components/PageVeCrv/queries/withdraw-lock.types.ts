import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export type WithdrawLockFormValues = Record<string, never>

export type WithdrawLockQuery = {
  chainId: ChainId
  userAddress: Address
  lockedAmount: Decimal
  /** Unix timestamp in milliseconds. */
  unlockTime: number
}

export type WithdrawLockParams = FieldsOf<WithdrawLockQuery>

export type WithdrawLockMutation = WithdrawLockFormValues
