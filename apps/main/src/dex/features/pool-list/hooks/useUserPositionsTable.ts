import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { useUserPoolClaimables, type UserPoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import { useUserPoolPositions, type UserPoolPosition } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import { useTokenUsdRates, type TokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { completeArray } from '@primitives/array.utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, useMappedQuery, type Query } from '@ui/features/queries/util'
import { decimalCompare, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { claimablesTotalUsd, enrichPoolRow, getPoolListAlerts, poolToRowData } from '../utils'

const getPoolUserPosition = (
  position: UserPoolPosition['positions'][number],
  tokenRates: TokenUsdRates | undefined,
  claimables: Query<UserPoolClaimables>,
) => ({
  lpBalance: position.totalBalance,
  depositsUsd: maybe(tokenRates?.[position.lpTokenAddress], price => decimalMultiply(position.totalBalance, price)),
  claimables: mapQuery(claimables, pools => pools[position.address]),
  claimablesUsd: claimablesTotalUsd(claimables.data?.[position.address]),
})

export const useUserPositionsTable = ({ network }: { network: NetworkConfig }) => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress })
  const claimables = useUserPoolClaimables({ chainId, userAddress }, positions)

  const tokenAddresses = useMappedQuery(
    positions,
    useCallback(({ positions }) => positions.map(({ lpTokenAddress }) => lpTokenAddress), []),
  )
  const tokenRates = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses.data }, !!userAddress)

  const tableQuery = useMappedQuery(
    positions,
    useCallback(
      ({ positions }) =>
        positions
          .map(position =>
            enrichPoolRow(
              poolToRowData(position),
              network,
              campaigns.data,
              getPoolUserPosition(position, tokenRates.data, {
                data: claimables.data,
                isLoading: claimables.isLoading,
                error: claimables.error,
              }),
            ),
          )
          .toSorted((a, b) => {
            const first = a.userPosition?.depositsUsd
            const second = b.userPosition?.depositsUsd
            if (first == null) return second == null ? 0 : 1
            if (second == null) return -1
            return decimalCompare(second, first)
          }),
      [network, campaigns.data, tokenRates.data, claimables.data, claimables.isLoading, claimables.error],
    ),
  )

  return {
    isFetching: positions.isFetching || campaigns.isLoading || claimables.isFetching,
    onReload: () => resetPoolLists({ chainId, userAddress }),
    tableQuery,
    alerts: getPoolListAlerts(tableQuery.data, blockchainId),
    claimablesTotalUsd: mapQuery(claimables, pools =>
      maybe(completeArray(Object.values(pools).map(claimablesTotalUsd)), amounts => decimalSum(...amounts)),
    ),
    totalLiquidityUsd: mapQuery(tableQuery, rows =>
      maybe(completeArray(rows.map(({ userPosition }) => userPosition?.depositsUsd)), amounts =>
        decimalSum(...amounts),
      ),
    ),
  }
}
