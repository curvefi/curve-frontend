import { isAddressEqual } from 'viem'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { PoolParams } from '@evm-ui/queries/query-types'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { mapQuery } from '@ui/features/queries/util'

export const useLitePool = ({ chainId, poolAddress }: PoolParams) =>
  mapQuery(
    useLitePoolList({ chainId }, chainId != null && isLiteChain(chainId)),
    ({ pools }) => pools.find(pool => poolAddress && isAddressEqual(pool.address, poolAddress)) ?? null,
  )
