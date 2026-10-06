import { capitalize } from 'lodash'
import { useCallback } from 'react'
import { isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { getPool } from '@/dex/pool.utils'
import { resetPoolLists } from '@/dex/queries/invalidation'
import { usePoolAddresses } from '@/dex/queries/pool-addresses.query'
import { useUserPoolClaimables } from '@/dex/queries/user-pool-claimables.query'
import { useUserPoolPositions } from '@/dex/queries/user-pool-positions.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import type { PoolClaimables } from '@ui/features/pool-list/types'
import { hasClaimableRewards } from '@ui/features/pool-list/utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { constQ, mapQuery } from '@ui/features/queries/util'
import { decimalCompare, decimalGreaterThan, decimalSum, ZERO } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { claimablesTotalUsd, curvePoolToRowData, enrichPoolRow, getPoolListAlerts } from '../utils'

const getPoolUserPosition = (claimables: PoolClaimables) => ({
  lpBalance: ZERO,
  depositsUsd: constQ(ZERO),
  claimables: constQ(claimables),
  claimablesUsd: constQ(claimablesTotalUsd(claimables)),
})

export const useResidualClaimsTable = ({ network }: { network: NetworkConfig }, enabled = true) => {
  const { chainId, blockchainId } = network
  const { address: userAddress } = useConnection()
  const { curveApi, isHydrated } = useCurve()

  const campaigns = useCampaigns({ blockchainId })
  const positions = useUserPoolPositions({ chainId, userAddress }, enabled)
  const poolAddresses = usePoolAddresses({ chainId }, enabled)
  const claimables = useUserPoolClaimables({ chainId, userAddress, poolAddresses: poolAddresses.data }, enabled)

  const tableQuery = useCombinedQueries(
    [positions, poolAddresses, claimables],
    useCallback(
      ({ positions }, addresses, rewards) =>
        // Out of all pools, we want those that have claimable rewards but no LP balance for the user.
        isHydrated
          ? addresses
              .filter(
                address =>
                  hasClaimableRewards(rewards[address]) &&
                  !positions.some(
                    position =>
                      isAddressEqual(position.address, address) && decimalGreaterThan(position.totalBalance, ZERO),
                  ),
              )
              .map(address =>
                enrichPoolRow(
                  curvePoolToRowData(getPool(address, curveApi)),
                  network,
                  campaigns.data,
                  getPoolUserPosition(rewards[address]),
                ),
              )
              .toSorted((a, b) =>
                decimalCompare(b.userPosition?.claimablesUsd.data ?? ZERO, a.userPosition?.claimablesUsd.data ?? ZERO),
              )
          : undefined,
      [isHydrated, curveApi, network, campaigns.data],
    ),
  )

  const scanPoolCount = poolAddresses.data?.length

  return {
    isFetching: positions.isFetching || campaigns.isLoading || poolAddresses.isFetching || claimables.isFetching,
    onReload: () => resetPoolLists({ chainId, userAddress }),
    tableQuery,
    alerts: getPoolListAlerts(tableQuery.data, blockchainId),
    claimablesTotalUsd: mapQuery({ ...tableQuery, error: null }, rows =>
      decimalSum(...rows.map(row => row.userPosition?.claimablesUsd.data)),
    ),
    labels: {
      errorTitle: t`Could not scan pools for unclaimed rewards`,
      loading: {
        title: t`Searching for your residual rewards`,
        description: t`Scanning ${scanPoolCount ? scanPoolCount.toString() : 'all'} ${capitalize(blockchainId)} pools. This may take a while.`,
      },
      empty: {
        title: t`No residual rewards`,
        description: t`You have claimed all your rewards on ${capitalize(blockchainId)}`,
      },
    },
  }
}
