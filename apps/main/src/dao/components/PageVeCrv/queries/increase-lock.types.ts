import type { ChainId } from '@/dao/types/dao.types'
import type { FieldsOf } from '@evm-ui/lib'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export type IncreaseLockFormValues = {
  lockedAmount: Decimal | undefined
  maxLockedAmount: Decimal | undefined
}

export type IncreaseLockQuery = {
  chainId: ChainId
  userAddress: Address
  lockedAmount: Decimal
}

export type IncreaseLockParams = FieldsOf<IncreaseLockQuery>

export type IncreaseLockMutation = Pick<IncreaseLockQuery, 'lockedAmount'>
