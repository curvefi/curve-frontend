import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import { poolToRowData } from '@ui/features/pool-list/utils'
import { enrichPoolRow, getPoolListAlerts } from '../../pool-list/utils'
import type { BalancerPosition } from '../api/balancer.api'
import { type CurveCandidate, rankCurveTargets } from '../migration.utils'
import { useCurveTargetPools } from '../queries/curve-target-pools.query'

/**
 * Ranked targets with their pool-list rows. Falls back to legacy prices data while pool-list rows load,
 * so the ranking ignores pool types until then.
 */
export const useCurveTargets = ({
  network,
  position,
  candidates,
}: {
  network: NetworkConfig | undefined
  position: BalancerPosition | undefined
  candidates: CurveCandidate[]
}) => {
  const { chainId, blockchainId = 'ethereum' } = network ?? {}
  const poolAddresses = useMemo(() => candidates.map(({ pool }) => pool.address), [candidates])
  const poolRows = useCurveTargetPools({ chainId, poolAddresses }, poolAddresses.length > 0)
  const campaigns = useCampaigns({ blockchainId })

  const targets = useMemo(
    () =>
      network && position
        ? rankCurveTargets(
            position,
            candidates.map(candidate => ({
              ...candidate,
              row: enrichPoolRow(
                poolRows.data?.find(({ address }) => isAddressEqual(address, candidate.pool.address)) ??
                  poolToRowData({ ...candidate.pool, tradeableCoins: candidate.pool.coins, extraRewardsApr: [] }),
                network,
                campaigns.data,
                undefined,
              ),
            })),
          )
        : [],
    [candidates, position, poolRows.data, network, campaigns.data],
  )
  const rows = useMemo(() => targets.map(({ row }) => row), [targets])
  return { targets, rows, alerts: getPoolListAlerts(rows, blockchainId) }
}
