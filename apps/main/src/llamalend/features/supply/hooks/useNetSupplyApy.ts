import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketVaultOnChainRewards } from '@/llamalend/queries/market'
import { useUserSupplyBoost } from '@/llamalend/queries/user'
import { requireVault } from '@/llamalend/queries/validation/supply.validation'
import {
  getLatestSnapshotValue,
  getSupplyApyMetrics,
  sumOnChainExtraIncentivesApr,
  toNumberOrNull,
} from '@/llamalend/rates.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import type { QueryProp } from '@ui-kit/types/util'
import { BlockchainIds, decimal } from '@ui-kit/utils'

type SupplyRatesQuery = QueryProp<{ lendApy?: Decimal } | null>

export function useNetSupplyApy(
  {
    params,
    marketRates,
    expectedMarketRates,
  }: {
    params: UserMarketParams
    marketRates: SupplyRatesQuery
    expectedMarketRates?: SupplyRatesQuery
  },
  isOpen: boolean,
) {
  const blockchainId = params.chainId != null ? BlockchainIds[params.chainId] : undefined
  const market = params.marketId ? requireVault(params.marketId) : undefined
  const snapshotsQuery = useLlamaSnapshot(market, blockchainId, isOpen)
  const marketOnChainRewardsQuery = useMarketVaultOnChainRewards(params, isOpen)
  const userSupplyBoostQuery = useUserSupplyBoost(params, isOpen)
  const lendingSnapshots = snapshotsQuery.data as LendingSnapshot[] | undefined

  const buildNetSupplyApy = (ratesQuery: SupplyRatesQuery) => {
    const { totalUserBoost } = getSupplyApyMetrics({
      supplyApy: toNumberOrNull(ratesQuery.data?.lendApy),
      crvMinBoostApr: marketOnChainRewardsQuery.data?.crvRates?.[0],
      crvMaxBoostApr: marketOnChainRewardsQuery.data?.crvRates?.[1],
      rebasingYieldApy:
        getLatestSnapshotValue(lendingSnapshots, (snapshot) => snapshot.borrowedToken.rebasingYield) ?? 0,
      extraIncentivesApr: sumOnChainExtraIncentivesApr(marketOnChainRewardsQuery.data?.rewardsApr),
      userSupplyBoost: userSupplyBoostQuery.data,
    })

    return {
      data: decimal(totalUserBoost),
      ...combineQueryState(ratesQuery, snapshotsQuery, marketOnChainRewardsQuery, userSupplyBoostQuery),
    }
  }

  return {
    netSupplyApy: buildNetSupplyApy(marketRates),
    expectedNetSupplyApy: expectedMarketRates && buildNetSupplyApy(expectedMarketRates),
  }
}
