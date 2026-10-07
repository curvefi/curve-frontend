import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import { poolToRowData } from '@ui/features/pool-list/utils'
import { enrichPoolRow, getPoolListAlerts } from '../../pool-list/utils'
import type { CurveTarget } from '../migration.utils'
import { useCurveTargetPools } from '../queries/curve-target-pools.query'

/** Pool-list rows for the targets, in target order. Falls back to legacy prices data while pool-list rows load. */
export const useCurveTargetRows = ({
  network,
  targets,
}: {
  network: NetworkConfig | undefined
  targets: CurveTarget[]
}) => {
  const { chainId, blockchainId = 'ethereum' } = network ?? {}
  const poolAddresses = useMemo(() => targets.map(({ pool }) => pool.address), [targets])
  const poolRows = useCurveTargetPools({ chainId, poolAddresses }, poolAddresses.length > 0)
  const campaigns = useCampaigns({ blockchainId })

  const rows = useMemo(
    () =>
      network
        ? targets.map(({ pool }) =>
            enrichPoolRow(
              poolRows.data?.find(({ address }) => isAddressEqual(address, pool.address)) ??
                poolToRowData({ ...pool, tradeableCoins: pool.coins, extraRewardsApr: [] }),
              network,
              campaigns.data,
              undefined,
            ),
          )
        : [],
    [targets, poolRows.data, network, campaigns.data],
  )
  return { rows, alerts: getPoolListAlerts(rows, blockchainId), isFetching: poolRows.isFetching }
}
