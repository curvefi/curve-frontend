import { networks } from '@/lend/networks'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { SupplyPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { useMarketVaultOnChainRewards, useMarketVaultPricePerShare, useMarketRates } from '@/llamalend/queries/market'
import { useUserBalances, useUserSupplyBoost } from '@/llamalend/queries/user'
import { getSupplyRateMetrics, sumRates, toNumberOrNull, LAST_MONTH } from '@/llamalend/rates.utils'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseSupplyPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
  userAddress: Address | undefined
}

const AVERAGE_MULTIPLIER = LAST_MONTH
const AVERAGE_RATE_LABEL = `${AVERAGE_MULTIPLIER}D`

export const useSupplyPositionDetails = ({
  chainId,
  market,
  marketId,
  userAddress,
}: UseSupplyPositionDetailsProps): SupplyPositionDetailsProps => {
  const { isHydrated } = useCurve()
  const blockchainId = networks[chainId].id as Chain
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
    agg: 'day',
    limit: AVERAGE_MULTIPLIER,
  })

  const supplyMetrics = getSupplyRateMetrics({
    supplyApy: toNumberOrNull(marketRates?.lendApy),
    snapshots: lendingSnapshots,
    onChainCrvRates: onChainRewards?.crvRates,
    onChainRewardsApr: onChainRewards?.rewardsApr,
    daysBack: AVERAGE_MULTIPLIER,
  })

  const userCurrentCRVApr = (supplyMetrics.supplyAprCrvMinBoost ?? 0) * (userSupplyBoost ?? 1)
  const userTotalCurrentSupplyApr = supplyMetrics.supplyApy
    ? sumRates(
        supplyMetrics.supplyApy,
        supplyMetrics.rebasingYield,
        supplyMetrics.extraIncentivesTotalApr,
        userCurrentCRVApr,
      )
    : null

  const sharesValue = userBalances?.vaultShares ? Number(userBalances.vaultShares) + Number(userBalances.gauge) : null
  const depositedAmount =
    marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
      ? Number(marketPricePerShare) * (Number(userBalances.vaultShares) + Number(userBalances.gauge))
      : null

  return {
    userSupplyRate: {
      ...supplyMetrics,
      averageRateLabel: AVERAGE_RATE_LABEL,
      userCurrentCRVApr,
      userTotalCurrentSupplyApr,
      extraIncentives: onChainRewards?.rewardsApr
        ? onChainRewards.rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId,
            address: r.tokenAddress,
          }))
        : [],
      extraRewards: campaigns,
      loading:
        islendingSnapshotsLoading ||
        isOnChainRewardsLoading ||
        isUserBalancesLoading ||
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
