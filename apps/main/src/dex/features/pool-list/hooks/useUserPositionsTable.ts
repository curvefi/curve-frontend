import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { type UserPoolClaimables, useUserPoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import { type UserPoolPosition, useUserPoolPositions } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { notFalsy } from '@primitives/objects.utils'
import { aggregateQueries, combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type Query, type QueryProp, useMappedQuery } from '@ui/features/queries/util'
import { decimalCompare, decimalMultiply, decimalSum, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { claimablesTotalUsd, enrichPoolRow, getPoolListAlerts, poolToRowData } from '../utils'

const getPoolUserPosition = (
  position: UserPoolPosition['positions'][number],
  tokenRate: QueryProp<number>,
  claimables: Query<UserPoolClaimables>,
) => ({
  lpBalance: position.totalBalance,
  depositsUsd: mapQuery(tokenRate, price => decimalMultiply(position.totalBalance, price)),
  claimables: mapQuery(claimables, pools => pools[position.address]),
  claimablesUsd: mapQuery(claimables, data => claimablesTotalUsd(data?.[position.address])),
})

export const useUserPositionsTable = ({ network }: { network: NetworkConfig }, enabled = true) => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress }, enabled)
  const poolAddresses = useMappedQuery(
    positions,
    useCallback(({ positions }) => positions.map(({ address }) => address), []),
  )
  const claimables = useUserPoolClaimables({ chainId, userAddress, poolAddresses: poolAddresses.data }, enabled)

  const tokenAddresses = useMappedQuery(
    positions,
    useCallback(({ positions }) => positions.map(({ lpTokenAddress }) => lpTokenAddress), []),
  )
  const tokenRates = useTokenUsdRates({ chainId, tokenAddresses: tokenAddresses.data }, enabled && !!userAddress)

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
              getPoolUserPosition(position, tokenRates[position.lpTokenAddress], {
                data: claimables.data,
                isLoading: claimables.isLoading,
                error: claimables.error,
              }),
            ),
          )
          .toSorted((a, b) =>
            decimalCompare(b.userPosition?.depositsUsd.data ?? ZERO, a.userPosition?.depositsUsd.data ?? ZERO),
          ),
      [network, campaigns.data, tokenRates, claimables.data, claimables.isLoading, claimables.error],
    ),
  )

  return {
    isFetching: positions.isFetching || campaigns.isLoading || claimables.isFetching,
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
