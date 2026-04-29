import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketSupplyFutureRates, useMarketRates, useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import { useUserSupplyBoost } from '@/llamalend/queries/user'
import { requireVault } from '@/llamalend/queries/validation/supply.validation'
import {
  getLatestSnapshotValue,
  getSupplyApyMetrics,
  sumOnChainExtraIncentivesApy,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { q, type Query, type QueryProp, type Range } from '@ui-kit/types/util'
import { BlockchainIds, decimal } from '@ui-kit/utils'

type SupplyRewards = {
  crvRates?: Range<number> | null
  rewardsApr?: { apy: number; symbol: string; tokenAddress: string }[]
}

/**
 * Combines the given markets rates, on-chain rewards, user boost and snapshotsQuery to calculate net supply APY.
 */
const addNetApy = <T extends { lendApy?: Decimal }>(
  rates: Query<T>,
  snapshotsQuery: Query<LendingSnapshot[] | undefined>,
  marketOnChainRewardsQuery: Query<SupplyRewards | undefined>,
  userSupplyBoostQuery: Query<number | null>,
) => {
  const rebasingYieldApy = getLatestSnapshotValue(
    snapshotsQuery.data,
    (snapshot) => snapshot.borrowedToken.rebasingYield,
  )
  // todo: refactor using decimals for calculation, rounding errors causes supplyApy != netSupplyApy even when identical
  const { totalUserBoost } = getSupplyApyMetrics({
    supplyApy: toNumberOrNull(rates.data?.lendApy),
    crvBoostApr: marketOnChainRewardsQuery.data?.crvRates,
    rebasingYieldApy: rebasingYieldApy ?? 0,
    extraIncentivesApy: sumOnChainExtraIncentivesApy(marketOnChainRewardsQuery.data?.rewardsApr),
    userSupplyBoost: userSupplyBoostQuery.data,
  })
  const netSupplyApy = q({
    data: decimal(totalUserBoost),
    ...combineQueryState(rates, snapshotsQuery, marketOnChainRewardsQuery, userSupplyBoostQuery),
  })
  return [q(rates), netSupplyApy] satisfies [QueryProp<T>, QueryProp<Decimal | null>]
}

/** Returns previous/current supply rates and net supply APY for SupplyActionInfoList. */
export function useSupplyRates<ChainId extends IChainId>(
  {
    params: { chainId, marketId, userAddress },
    reservesDelta,
  }: {
    params: UserMarketParams<ChainId>
    reservesDelta?: Decimal | null
  },
  enabled: boolean,
) {
  const blockchainId = chainId == null ? undefined : BlockchainIds[chainId]
  const market = marketId ? requireVault(marketId) : undefined
  const snapshotsQuery = useLlamaSnapshot(market, blockchainId, enabled)
  const lendingSnapshotsQuery = q({
    ...snapshotsQuery,
    data: snapshotsQuery.data as LendingSnapshot[] | undefined,
  })
  const marketOnChainRewardsQuery = useMarketVaultOnChainRewards({ chainId, marketId }, enabled)
  const userSupplyBoostQuery = useUserSupplyBoost({ chainId, marketId, userAddress }, enabled)

  // Without `reservesDelta`, `rates`/`netSupplyApy` are disabled on purpose. `ActionInfo` shows `prevRates` as current.
  const [rates, netSupplyApy] = addNetApy(
    useMarketSupplyFutureRates({ chainId, marketId, reserves: reservesDelta }, enabled),
    lendingSnapshotsQuery,
    marketOnChainRewardsQuery,
    userSupplyBoostQuery,
  )
  const [prevRates, prevNetSupplyApy] = addNetApy(
    useMarketRates({ chainId, marketId }, enabled),
    lendingSnapshotsQuery,
    marketOnChainRewardsQuery,
    userSupplyBoostQuery,
  )

  return { prevRates, rates, prevNetSupplyApy, netSupplyApy }
}
