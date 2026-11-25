import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { usePoolCampaigns } from '@/dex/hooks/usePoolCampaigns'
import { resetPoolLists } from '@/dex/queries/invalidation'
import type { UserFullPoolPosition } from '@/dex/queries/user-full-pool-positions.query'
import { useUserPoolBoosts } from '@/dex/queries/user-pool-boost.query'
import { type UserPoolClaimables, useUserPoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import type { UserPositionsTableData } from '@ui/features/pool-list/types'
import { claimablesTotalUsd, litePoolToRowData, poolToRowData } from '@ui/features/pool-list/utils'
import { combineSubQueries, useCombinedQueries } from '@ui/features/queries/combine'
import { constQ, mapQuery, type Query, type QueryProp, useMappedQuery } from '@ui/features/queries/util'
import { decimalCompare, decimalMultiply, decimalSum, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { enrichPoolRow, getPoolListAlerts } from '../utils'
import { type UserPoolPosition, useUserPoolPositions } from './useUserPoolPositions'

const getPoolUserPosition = (
  position: UserPoolPosition,
  tokenRate: QueryProp<number>,
  claimables: Query<UserPoolClaimables>,
  boost: QueryProp<Decimal | null>,
) => ({
  lpBalance: position.totalBalance,
  depositsUsd: mapQuery(tokenRate, price => decimalMultiply(position.totalBalance, price)),
  boost,
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

  const { data: campaigns, isLoading: isCampaignsLoading } = usePoolCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress }, enabled)
  const litePoolList = useLitePoolList({ chainId }, enabled && isLite && !!userAddress)
  const poolAddresses = useMappedQuery(
    positions,
    useCallback(positions => positions.map(({ address }) => address), []),
  )
  const {
    data: boosts,
    error: boostsError,
    isPending: isBoostsPending,
  } = useUserPoolBoosts({ chainId, userAddress, poolAddresses }, enabled && !isLite)
  const {
    data: claimables,
    error: claimablesError,
    isLoading: isClaimablesLoading,
    isFetching: isClaimablesFetching,
  } = useUserPoolClaimables({ chainId, userAddress, poolAddresses }, enabled)

  const tokenAddresses = useMappedQuery(
    positions,
    useCallback(positions => positions.map(({ lpTokenAddress }) => lpTokenAddress), []),
  )
  const tokenRates = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses.data }, enabled && !!userAddress)

  const tableQuery = useCombinedQueries([positions, isLite ? litePoolList : constQ(null)], (positions, litePools) =>
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
          campaigns,
          getPoolUserPosition(
            position,
            tokenRates[position.lpTokenAddress],
            { data: claimables, isLoading: isClaimablesLoading, error: claimablesError },
            mapQuery(
              // isPending because we want to show loading state during hydration (but not when the query is disabled)
              { data: boosts, error: boostsError, isLoading: enabled && !isLite && isBoostsPending },
              values => values[position.address],
            ),
          ),
        ),
      ])
      .toSorted((a, b) =>
        decimalCompare(b.userPosition?.depositsUsd.data ?? ZERO, a.userPosition?.depositsUsd.data ?? ZERO),
      ),
  )

  return {
    isFetching: positions.isFetching || isCampaignsLoading || isClaimablesFetching || litePoolList.isFetching,
    onReload: () => resetPoolLists({ chainId, userAddress }),
    tableQuery,
    alerts: getPoolListAlerts(tableQuery.data, blockchainId),
    claimablesTotalUsd: combineSubQueries(tableQuery, row => row.userPosition?.claimablesUsd, decimalSum),
    totalLiquidityUsd: combineSubQueries(tableQuery, row => row.userPosition?.depositsUsd, decimalSum),
    labels: {
      errorTitle: t`Could not load pool positions`,
      loading: { title: t`Loading positions` },
      empty: { title: t`No active positions`, description: t`Provide liquidity to a pool to see your positions here.` },
    },
  }
}
