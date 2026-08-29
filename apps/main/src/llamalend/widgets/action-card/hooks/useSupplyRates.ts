import {
  useMarketRates,
  useMarketSnapshots,
  useMarketSupplyFutureRates,
  useMarketVaultOnChainRewards,
} from '@/llamalend/queries/market'
import { useUserSupplyBoost } from '@/llamalend/queries/user'
import {
  getCampaignAprs,
  getLatestSnapshotValue,
  getOnChainExtraIncentiveAprs,
  getSupplyRateMetrics,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type CampaignRewards, useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import type { LendingSnapshot } from '@evm-ui/entities/lending-snapshots'
import { useAprToApy } from '@evm-ui/hooks/useAprToApy'
import type { UserMarketParams } from '@evm-ui/lib/model'
import { combineQueryState } from '@evm-ui/lib/queries/combine'
import { MarketType } from '@evm-ui/types/market'
import { q, type Query, type QueryProp, type Range } from '@evm-ui/types/util'
import { BlockchainIds, decimal } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

type SupplyRewards = {
  crvRates?: Range<number> | null
  rewardsApr?: { apr: number; symbol: string; tokenAddress: string }[]
}

/**
 * Combines raw APR components and converts each one before calculating the displayed net supply rate.
 */
const addSupplyRates = <T extends { lendApr?: Decimal }>(
  rates: Query<T>,
  snapshotsQuery: Query<LendingSnapshot[] | undefined>,
  marketOnChainRewardsQuery: Query<SupplyRewards | undefined>,
  campaignsQuery: Query<CampaignRewards[] | undefined>,
  userSupplyBoostQuery: Query<Decimal | null>,
  convertRate: ReturnType<typeof useAprToApy>,
) => {
  const rebasingYieldApr = getLatestSnapshotValue(
    snapshotsQuery.data,
    snapshot => snapshot.borrowedToken.rebasingYieldApr,
  )
  const supplyApr = toNumberOrNull(rates.data?.lendApr)
  const { totalUserBoost } = getSupplyRateMetrics({
    supplyApr,
    crvBoostApr: marketOnChainRewardsQuery.data?.crvRates,
    rebasingYieldApr: rebasingYieldApr ?? 0,
    extraIncentivesApr: getOnChainExtraIncentiveAprs(marketOnChainRewardsQuery.data?.rewardsApr),
    campaignsApr: getCampaignAprs(campaignsQuery.data),
    userSupplyBoost: userSupplyBoostQuery.data,
    convertRate,
  })
  const queryState = combineQueryState(
    rates,
    snapshotsQuery,
    marketOnChainRewardsQuery,
    campaignsQuery,
    userSupplyBoostQuery,
  )
  const supplyRate = q({
    data: decimal(convertRate(supplyApr)),
    ...queryState,
  })
  const netSupplyRate = q({
    data: decimal(totalUserBoost),
    ...queryState,
  })
  return [supplyRate, netSupplyRate] satisfies [QueryProp<Decimal | null>, QueryProp<Decimal | null>]
}

/** Returns previous/current base and net supply rates for SupplyActionInfoList. */
export function useSupplyRates<ChainId extends IChainId>(
  {
    params: { chainId, marketId, userAddress },
    controllerAddress,
    reservesDelta,
  }: {
    params: UserMarketParams<ChainId>
    reservesDelta?: Decimal | null
    controllerAddress: Address | undefined
  },
  enabled: boolean,
) {
  const convertRate = useAprToApy()
  const blockchainId = maybe(chainId, chainId => BlockchainIds[chainId])
  const snapshotsQuery = useMarketSnapshots({
    marketType: MarketType.Lend,
    controllerAddress,
    blockchainId,
    enabled,
  })
  const lendingSnapshotsQuery = q({
    ...snapshotsQuery,
    data: snapshotsQuery.data,
  })
  const marketOnChainRewardsQuery = useMarketVaultOnChainRewards({ chainId, marketId }, enabled)
  const userSupplyBoostQuery = useUserSupplyBoost({ chainId, marketId, userAddress }, enabled)
  const campaignsQuery = useCampaignsByAddress({ blockchainId, address: controllerAddress })

  // Without `reservesDelta`, future rates are disabled on purpose. `ActionInfo` shows previous rates as current.
  const [supplyRate, netSupplyRate] = addSupplyRates(
    useMarketSupplyFutureRates({ chainId, marketId, reserves: reservesDelta }, enabled),
    lendingSnapshotsQuery,
    marketOnChainRewardsQuery,
    campaignsQuery,
    userSupplyBoostQuery,
    convertRate,
  )
  const [prevSupplyRate, prevNetSupplyRate] = addSupplyRates(
    useMarketRates({ chainId, marketId }, enabled),
    lendingSnapshotsQuery,
    marketOnChainRewardsQuery,
    campaignsQuery,
    userSupplyBoostQuery,
    convertRate,
  )

  return { prevSupplyRate, supplyRate, prevNetSupplyRate, netSupplyRate }
}
