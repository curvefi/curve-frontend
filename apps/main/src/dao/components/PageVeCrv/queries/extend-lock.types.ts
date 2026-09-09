import type { ChainId } from '@/dao/types/dao.types'
import type { UserChainQuery } from '@evm-ui/lib/model'
import type { CalendarDate } from '@internationalized/date'
import type { FieldsOf } from '@ui/lib/validation/types'

export type ExtendLockFormValues = {
  utcDate: CalendarDate | null
  days: number
  minUnlockDate: CalendarDate | null
  maxUnlockDate: CalendarDate | null
}

export type ExtendLockQuery = UserChainQuery<ChainId> & { days: number }

export type ExtendLockParams = FieldsOf<ExtendLockQuery>

export type ExtendLockMutation = ExtendLockFormValues
