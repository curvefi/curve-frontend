import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { CalendarDate } from '@internationalized/date'

export type ExtendLockFormValues = {
  utcDate: CalendarDate | null
  days: number
  minUnlockDate: CalendarDate | null
  maxUnlockDate: CalendarDate | null
}

export type ExtendLockQuery = { chainId: ChainId; userAddress: string; days: number }

export type ExtendLockParams = FieldsOf<ExtendLockQuery>

export type ExtendLockMutation = ExtendLockFormValues
