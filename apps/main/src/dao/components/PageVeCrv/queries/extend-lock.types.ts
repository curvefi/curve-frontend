import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { CalendarDate } from '@internationalized/date'
import type { Address } from '@primitives/address.utils'

export type ExtendLockFormValues = {
  utcDate: CalendarDate | null
  days: number
  minUnlockDate: CalendarDate | null
  maxUnlockDate: CalendarDate | null
}

export type ExtendLockQuery = { chainId: ChainId; userAddress: Address; days: number }

export type ExtendLockParams = FieldsOf<ExtendLockQuery>

export type ExtendLockMutation = ExtendLockFormValues
