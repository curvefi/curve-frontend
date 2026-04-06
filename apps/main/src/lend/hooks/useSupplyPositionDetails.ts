import { networks } from '@/lend/networks'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { SupplyPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { useMarketVaultOnChainRewards, useMarketVaultPricePerShare, useMarketRates } from '@/llamalend/queries/market'
import { useUserBalances, useUserSupplyBoost } from '@/llamalend/queries/user'
import {
  formatSupplyExtraIncentives,
  getSupplyApyMetrics,
  toNumberOrNull,
  aprToApy,
  sumOnChainExtraIncentivesApy,
  getSupplyApyAverageMetrics,
  getLatestSnapshotValue,
} from '@/llamalend/rates.utils'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { AVERAGE_CATEGORIES, type AverageCategory } from '@ui-kit/utils'

type UseSupplyPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
  userAddress: Address | undefined
}

const RATE_CATEGORY: AverageCategory = 'llamalend.market.rate'

export const useSupplyPositionDetails = ({
  chainId,
  market,
  marketId,
  userAddress,
}: UseSupplyPositionDetailsProps): SupplyPositionDetailsProps => {
  const { isHydrated } = useCurve()
  const blockchainId = networks[chainId].id as Chain
  const { window: rateWindow } = AVERAGE_CATEGORIES[RATE_CATEGORY]
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.addresses?.vault?.toLocaleLowerCase() as Address,
  })
  const { data: userBalances, isLoading: isUserBalancesLoading } = useUserBalances({ chainId, marketId })
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketVaultPricePerShare({
    chainId,
    marketId,
  })
  const { data: userSupplyBoost, isLoading: isUserSupplyBoostLoading } = useUserSupplyBoost({
    chainId,
    marketId,
    userAddress,
  })
  const { data: onChainRewards, isLoading: isOnChainRewardsLoading } = useMarketVaultOnChainRewards({
    chainId,
    marketId,
  })
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({
    chainId,
    marketId,
  })
  const { data: suppliedAssetUsdRate, isLoading: suppliedAssetUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })
  const { data: lendingSnapshots, isLoading: islendingSnapshotsLoading } = useLendingSnapshots({
    blockchainId,
    contractAddress: market?.addresses?.controller as Address,
    limit: rateWindow,
  })

  const rebasingYield = getLatestSnapshotValue(lendingSnapshots, (snapshot) => snapshot.borrowedToken.rebasingYield)

  const supplyMetrics = getSupplyApyMetrics({
    supplyApy: toNumberOrNull(marketRates?.lendApy),
    rebasingYieldApy: rebasingYield,
    crvMinBoostApr: onChainRewards?.crvRates?.[0],
    crvMaxBoostApr: onChainRewards?.crvRates?.[1],
    extraIncentivesApy: sumOnChainExtraIncentivesApy(onChainRewards?.rewardsApr),
    userSupplyBoost,
  })
  const supplyAverageMetrics = getSupplyApyAverageMetrics({
    snapshots: lendingSnapshots,
    daysBack: rateWindow,
    userSupplyBoost,
  })

  const sharesValue = userBalances?.vaultShares ? Number(userBalances.vaultShares) + Number(userBalances.gauge) : null
  const depositedAmount =
    marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
      ? Number(marketPricePerShare) * (Number(userBalances.vaultShares) + Number(userBalances.gauge))
      : null

  return {
    userSupplyRate: {
      ...supplyMetrics,
      ...supplyAverageMetrics,
      averageCategory: RATE_CATEGORY,
      extraIncentives: formatSupplyExtraIncentives({
        incentives:
          onChainRewards?.rewardsApr?.map((r) => ({
            title: r.symbol,
            percentage: aprToApy(r.apy) as number,
            blockchainId,
            address: r.tokenAddress,
          })) ?? [],
        baseRate: supplyMetrics.supplyApyCrvMinBoost,
        userBoost: userSupplyBoost,
      }),
      extraRewards: campaigns,
      loading:
        islendingSnapshotsLoading ||
        isOnChainRewardsLoading ||
        isUserBalancesLoading ||
        isUserSupplyBoostLoading ||
        isMarketRatesLoading ||
        !isHydrated,
    },
    boost: {
      value: userSupplyBoost,
      loading: isUserSupplyBoostLoading || !isHydrated,
    },
    shares: {
      value: sharesValue,
      staked: userBalances?.gauge ? Number(userBalances.gauge) : null,
      loading: isUserBalancesLoading || !isHydrated,
    },
    supplyAsset: {
      symbol: market?.borrowed_token.symbol,
      address: market?.borrowed_token.address,
      usdRate: suppliedAssetUsdRate,
      depositedAmount,
      depositedUsdValue:
        suppliedAssetUsdRate && marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
          ? Number(marketPricePerShare) *
            (Number(userBalances.vaultShares) + Number(userBalances.gauge)) *
            suppliedAssetUsdRate
          : null,
      loading: isMarketPricePerShareLoading || suppliedAssetUsdRateLoading || isUserBalancesLoading || !isHydrated,
    },
  }
}
