import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import type { StellarNetwork } from '@/stellar/lib/networks'
import type { DeepPartial } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'

export type NetworkQuery = { network: StellarNetwork }
export type PoolQuery = NetworkQuery & { pool: StellarContract }
export type PoolDecimalsQuery = PoolQuery & { decimals: number[] }
export type TokenQuery = NetworkQuery & { token: StellarContract }
export type UserQuery = { account: StellarAddress }
export type NetworkParams = FieldsOf<NetworkQuery>
export type PoolParams = FieldsOf<PoolQuery>
export type PoolDecimalsParams = FieldsOf<DeepPartial<PoolDecimalsQuery>>
export type TokenParams = FieldsOf<TokenQuery>
export type UserParams = FieldsOf<UserQuery>
