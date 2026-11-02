import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import type { NetworkQuery, UserQuery } from '@/stellar/queries/query-types'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import type { FieldsOf } from '@ui/lib/validation/types'

export type CreatePoolQuery = CreatePoolFormValues &
  NetworkQuery &
  UserQuery & { factory: StellarContract; implementationIndex: number; coins: StellarContract[] }
export type CreatePoolParams = FieldsOf<CreatePoolQuery>
export type CreatedPool = { pool: StellarContract; values: CreatePoolFormValues }

export type PoolDeploymentQuery = Pick<
  CreatePoolQuery,
  | 'network'
  | 'factory'
  | 'implementationIndex'
  | 'account'
  | 'poolName'
  | 'symbol'
  | 'amplification'
  | 'fee'
  | 'feeMultiplier'
  | 'priceOracleAveragingWindow'
> & { coins: StellarContract[] }

export type FactoryImplementationQuery = NetworkQuery & {
  factory: StellarContract
  implementationIndex: number
  coinCount: number
}
export type FactoryImplementationParams = FieldsOf<FactoryImplementationQuery>
