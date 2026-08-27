import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'

export type WithdrawLockFormValues = Record<string, never>

export type WithdrawLockQuery = {
  chainId: ChainId
  userAddress: string
  lockedAmount: string
  unlockTime: number
}

export type WithdrawLockParams = FieldsOf<WithdrawLockQuery>

export type WithdrawLockMutation = WithdrawLockFormValues
