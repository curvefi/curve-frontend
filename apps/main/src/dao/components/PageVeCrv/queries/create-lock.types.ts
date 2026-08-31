import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { UserChainQuery } from '@evm-ui/lib/model'
import type { CalendarDate } from '@internationalized/date'
import type { Decimal } from '@primitives/decimal.utils'

export type CreateLockFormValues = {
  lockedAmount: Decimal | undefined
  maxLockedAmount: Decimal | undefined
  /** A date-only value: the picker has day granularity and lock expiry is calculated separately by Curve. */
  utcDate: CalendarDate | null
  days: number
}

export type CreateLockQuery = UserChainQuery<ChainId> & { lockedAmount: Decimal; days: number }

export type CreateLockParams = FieldsOf<CreateLockQuery>

export type CreateLockMutation = Pick<CreateLockQuery, 'lockedAmount' | 'days'> & { utcDate: CalendarDate }
