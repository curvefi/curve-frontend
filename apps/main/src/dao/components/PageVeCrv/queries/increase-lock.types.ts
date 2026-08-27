import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { Decimal } from '@primitives/decimal.utils'

export type IncreaseLockFormValues = {
  lockedAmt: Decimal | undefined
  maxLockedAmt: Decimal | undefined
}

export type IncreaseLockQuery = {
  chainId: ChainId
  userAddress: string
  lockedAmt: Decimal
}

export type IncreaseLockParams = FieldsOf<IncreaseLockQuery>

export type IncreaseLockMutation = Pick<IncreaseLockQuery, 'lockedAmt'>
