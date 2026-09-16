import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import type { StellarNetwork } from '@/stellar/lib/networks'
import type { FieldsOf } from '@ui/lib/validation/types'

export type NetworkQuery = { network: StellarNetwork }
export type PoolQuery = NetworkQuery & { pool: StellarContract }
export type TokenQuery = NetworkQuery & { token: StellarContract }
export type UserQuery = { account: StellarAddress }
export type NetworkParams = FieldsOf<NetworkQuery>
export type PoolParams = FieldsOf<PoolQuery>
export type TokenParams = FieldsOf<TokenQuery>
export type UserParams = FieldsOf<UserQuery>

export const rootKeys = {
  network: ({ network }: NetworkParams) => ['network', { network }] as const,
  user: ({ account }: UserParams) => ['user', { account }] as const,
  pool: ({ network, pool }: PoolParams) => [...rootKeys.network({ network }), 'pool', { pool }] as const,
  token: ({ network, token }: TokenParams) => [...rootKeys.network({ network }), 'token', { token }] as const,
  userPool: (params: PoolParams & UserParams) => [...rootKeys.pool(params), ...rootKeys.user(params)] as const,
}
