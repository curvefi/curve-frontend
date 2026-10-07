import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import type { UserFullPoolPosition } from '@/dex/queries/user-full-pool-positions.query'
import { type UserPoolClaimables, useUserPoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import type { UserPositionsTableData } from '@ui/features/pool-list/types'
import { claimablesTotalUsd, litePoolToRowData, poolToRowData } from '@ui/features/pool-list/utils'
import { aggregateQueries, combineQueries, useCombinedQueries } from '@ui/features/queries/combine'
import { constQ, mapQuery, useMappedQuery, type Query, type QueryProp } from '@ui/features/queries/util'
import { decimalCompare, decimalMultiply, decimalSum, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { enrichPoolRow, getPoolListAlerts } from '../utils'
import { useUserPoolPositions, type UserPoolPosition } from './useUserPoolPositions'

const getPoolUserPosition = (
  position: UserPoolPosition,
  tokenRate: QueryProp<number>,
  claimables: Query<UserPoolClaimables>,
) => ({
  lpBalance: position.totalBalance,
  depositsUsd: mapQuery(tokenRate, price => decimalMultiply(position.totalBalance, price)),
  claimables: mapQuery(claimables, pools => pools[position.address]),
  claimablesUsd: mapQuery(claimables, data => claimablesTotalUsd(data?.[position.address])),
})

export const useUserPositionsTable = (
  { network }: { network: NetworkConfig },
  enabled = true,
): UserPositionsTableData => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()
  const isLite = isLiteChain(chainId)

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress }, enabled)
  const litePoolList = useLitePoolList({ chainId }, enabled && isLite && !!userAddress)
  const poolAddresses = useMappedQuery(
    positions,
    useCallback(positions => positions.map(({ address }) => address), []),
  )
  const claimables = useUserPoolClaimables({ chainId, userAddress, poolAddresses: poolAddresses.data }, enabled)

  const tokenAddresses = useMappedQuery(
    positions,
    useCallback(positions => positions.map(({ lpTokenAddress }) => lpTokenAddress), []),
  )
  const tokenRates = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses.data }, enabled && !!userAddress)

  const tableQuery = useCombinedQueries(
    [positions, isLite ? litePoolList : constQ(null)],
    useCallback(
      (positions, litePools) =>
        positions
          .map(position => ({
            position,
            pool: isLite
              ? maybe(
                  litePools?.pools.find(pool => isAddressEqual(pool.address, position.address)),
                  litePoolToRowData,
                )
              : poolToRowData(position as UserFullPoolPosition),
          }))
          .filter(({ pool }) => pool != null)
          .flatMap(({ position, pool }) => [
            enrichPoolRow(
              pool!,
              network,
              campaigns.data,
              getPoolUserPosition(position, tokenRates[position.lpTokenAddress], {
                data: claimables.data,
                isLoading: claimables.isLoading,
                error: claimables.error,
              }),
            ),
          ])
          .toSorted((a, b) =>
            decimalCompare(b.userPosition?.depositsUsd.data ?? ZERO, a.userPosition?.depositsUsd.data ?? ZERO),
          ),
      [isLite, network, campaigns.data, tokenRates, claimables.data, claimables.isLoading, claimables.error],
    ),
  )

  return {
    isFetching: positions.isFetching || campaigns.isLoading || claimables.isFetching || litePoolList.isFetching,
    onReload: () => resetPoolLists({ chainId, userAddress }),
    tableQuery,
    alerts: getPoolListAlerts(tableQuery.data, blockchainId),
    claimablesTotalUsd: combineQueries(
      [tableQuery, aggregateQueries(notFalsy(...(tableQuery.data?.map(row => row.userPosition?.claimablesUsd) ?? [])))],
      (rows, amounts) => (rows.length && amounts.every(amount => amount == null) ? undefined : decimalSum(...amounts)),
    ),
    totalLiquidityUsd: combineQueries(
      [tableQuery, aggregateQueries(notFalsy(...(tableQuery.data?.map(row => row.userPosition?.depositsUsd) ?? [])))],
      (rows, amounts) => (rows.length && amounts.every(amount => amount == null) ? undefined : decimalSum(...amounts)),
    ),
    labels: {
      errorTitle: t`Could not load pool positions`,
      loading: { title: t`Loading positions` },
      empty: { title: t`No active positions`, description: t`Provide liquidity to a pool to see your positions here.` },
    },
  }
}
