import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { STELLAR_NETWORKS, type StellarFactories, type StellarNetwork } from '@/stellar/lib/networks'
import type { PoolRegistrationParams, PoolRegistrationQuery } from '@/stellar/queries/query-types'
import { poolRegistrationValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { recordValues } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'

function allowedFactories(network: StellarNetwork) {
  const factories: StellarFactories = STELLAR_NETWORKS[network].factories
  return new Set(recordValues(factories).flatMap(fs => fs.map(f => f.address)))
}

export const { useQuery: usePoolRegistration } = queryFactory({
  queryKey: ({ network, pool, factory }: PoolRegistrationParams) =>
    ({ name: 'pool-registration', network, pool, factory }) as const,
  queryFn: async ({ network, pool, factory }: PoolRegistrationQuery) =>
    allowedFactories(network).has(factory)
      ? readContract<{ pool: StellarContract } | null>(network, factory, 'pool_registration_by_address', [pool])
      : null,
  category: 'dex.poolParams',
  validationSuite: poolRegistrationValidationSuite,
})
