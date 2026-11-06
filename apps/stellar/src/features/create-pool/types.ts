import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import type { NetworkQuery, UserQuery } from '@/stellar/queries/query-types'
import type { CreatePoolFormValues, PoolParameters } from '@ui/features/create-pool/types'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type CreatePoolValues = PoolParameters &
  Pick<CreatePoolFormValues, 'poolName' | 'symbol'> & { coins: StellarContract[] }
export type CreatePoolQuery = CreatePoolValues &
  NetworkQuery &
  UserQuery & { factory: StellarContract; implementationIndex: number; wasmHash: number[] }
export type CreatePoolParams = FieldsOf<DeepPartial<CreatePoolQuery>>
export type CreatePoolMutation = CreatePoolValues & { values: CreatePoolFormValues }
export type CreatedPool = { pool: StellarContract; values: CreatePoolFormValues }

export type FactoryImplementationQuery = NetworkQuery & {
  factory: StellarContract
  implementationIndex: number
  coinCount: number
}
export type FactoryImplementationParams = FieldsOf<FactoryImplementationQuery>
