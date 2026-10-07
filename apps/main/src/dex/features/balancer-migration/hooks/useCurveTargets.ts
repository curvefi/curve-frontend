import { useMemo, useState } from 'react'
import { isAddressEqual } from 'viem'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { useCampaigns } from '@evm-ui/queries/campaigns'
import type { Address } from '@primitives/address.utils'
import { recordValues } from '@primitives/objects.utils'
import type { PoolClassification } from '@ui/features/pool-list/cells/PoolTitleCell/classifications'
import { poolToRowData } from '@ui/features/pool-list/utils'
import { q } from '@ui/features/queries/util'
import { enrichPoolRow, getPoolListAlerts } from '../../pool-list/utils'
import { findCurveCandidates, rankCurveTargets } from '../migration.utils'
import { useCurveTargetPools } from '../queries/curve-target-pools.query'

/**
 * Ranked Curve targets for the selected source position, and the user's choice among them (the best one by default).
 * Falls back to legacy prices data while pool-list rows load, so the ranking ignores pool types until then.
 */
export const useCurveTargets = ({
  network,
  sourceTokens,
  classification,
}: {
  network: NetworkConfig | undefined
  /** Lowercase addresses each token of the selected source position may match as; undefined until one is selected. */
  sourceTokens: string[][] | undefined
  classification: PoolClassification | undefined
}) => {
  const { chainId, blockchainId = 'ethereum' } = network ?? {}
  const curvePools = usePoolsPricesApi({ blockchainId: getPricesApiBlockchainId(blockchainId) })
  const candidates = useMemo(
    () => (sourceTokens && curvePools.data ? findCurveCandidates(sourceTokens, recordValues(curvePools.data)) : []),
    [sourceTokens, curvePools.data],
  )
  const poolAddresses = useMemo(() => candidates.map(({ pool }) => pool.address), [candidates])
  const poolRows = useCurveTargetPools({ chainId, poolAddresses }, poolAddresses.length > 0)
  const campaigns = useCampaigns({ blockchainId })

  const targets = useMemo(
    () =>
      network
        ? rankCurveTargets(
            classification,
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
    [candidates, classification, poolRows.data, network, campaigns.data],
  )
  const rows = useMemo(() => targets.map(({ row }) => row), [targets])
  const [targetAddress, setTargetAddress] = useState<Address>()
  const target = targets.find(({ pool }) => pool.address === targetAddress) ?? targets[0]
  return {
    /** Undefined until Curve pools load, so the form starts with the best target selected. */
    target: curvePools.data && target,
    isLoaded: !!curvePools.data,
    setTargetAddress,
    tableProps: {
      query: q({ data: curvePools.data && rows, isLoading: curvePools.isLoading, error: curvePools.error }),
      alerts: getPoolListAlerts(rows, blockchainId),
      selectedAddress: target?.pool.address,
      onSelect: ({ address }: { address: Address }) => setTargetAddress(address),
      onReload: curvePools.refetch,
    },
  }
}
