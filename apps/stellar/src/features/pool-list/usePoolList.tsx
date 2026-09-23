import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { NetworkQuery } from '@/stellar/queries/root-keys'
import type { LitePool } from '@curvefi/prices-api/pools'
import { pick } from '@primitives/objects.utils'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { mapQuery } from '@ui/features/queries/util'

export function usePoolList({ network }: NetworkQuery) {
  const chainId = STELLAR_NETWORKS[network].chainId
  const litePools = useLitePoolList({ chainId })
  const query = mapQuery(litePools, ({ pools }) => pools.map(p => ({ ...p, network })))
  return { ...query, ...pick(litePools, 'isFetching', 'refetch') }
}

export type Pool = LitePool & NetworkQuery
