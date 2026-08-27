import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { CalendarDate } from '@internationalized/date'
import type { Decimal } from '@primitives/decimal.utils'

export type CreateLockFormValues = {
  lockedAmt: Decimal | undefined
  maxLockedAmt: Decimal | undefined
  /** A date-only value: the picker has day granularity and lock expiry is calculated separately by Curve. */
  utcDate: CalendarDate | null
  days: number
}

export type CreateLockQuery = {
  chainId: ChainId
  userAddress: string
  lockedAmt: Decimal
  days: number
}

export type CreateLockParams = FieldsOf<CreateLockQuery>

export type CreateLockApproveMutation = Pick<CreateLockQuery, 'lockedAmt'>
export type CreateLockMutation = Pick<CreateLockQuery, 'lockedAmt' | 'days'> & { utcDate: CalendarDate }
