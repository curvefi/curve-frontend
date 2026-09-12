import type { ChainId } from '@/dao/types/dao.types'
import type { UserChainQuery } from '@evm-ui/lib/model'
import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export type IncreaseLockFormValues = { lockedAmount: Decimal | undefined; maxLockedAmount: Decimal | undefined }

export type IncreaseLockQuery = UserChainQuery<ChainId> & { lockedAmount: Decimal }

export type IncreaseLockParams = FieldsOf<IncreaseLockQuery>

export type IncreaseLockMutation = Pick<IncreaseLockQuery, 'lockedAmount'>
