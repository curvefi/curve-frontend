import { meanBy } from 'lodash'
import { useMemo } from 'react'
import { useMarketOnChainRates, useMarketPricePerShare } from '@/lend/entities/market-details'
import { useUserMarketBalances } from '@/lend/entities/user-market-balances'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { SupplyPositionDetailsProps } from '@ui-kit/features/market-position-details/SupplyPositionDetails'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseSupplyPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

const averageMultiplier = 30
const averageMultiplierString = `${averageMultiplier}D`

export const useSupplyPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseSupplyPositionDetailsProps): SupplyPositionDetailsProps => {
  const { data: campaigns } = useCampaigns({})
  const { data: userBalances, isLoading: isUserBalancesLoading } = useUserMarketBalances({ chainId, marketId })
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[marketId])
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketPricePerShare({
    chainId: chainId,
    marketId,
  })
  const { data: onChainRates, isLoading: isOnChainRatesLoading } = useMarketOnChainRates({
    chainId,
    marketId,
  })
  const { data: suppliedAssetUsdRate, isLoading: suppliedAssetUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })
  const { data: lendingSnapshots, isLoading: islendingSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
    agg: 'day',
  })

  const averageAPR = useMemo(() => {
    if (!lendingSnapshots) return null

    const averageStartDate = new Date()
    averageStartDate.setDate(averageStartDate.getDate() - averageMultiplier)

    const recentSnapshots = lendingSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > averageStartDate)

    if (recentSnapshots.length === 0) return null

    return {
      rate: meanBy(recentSnapshots, ({ lendApr }) => lendApr) * 100,
      rebasingYield: meanBy(recentSnapshots, ({ borrowedToken }) => borrowedToken.rebasingYield) ?? null,
      minBoostApr: meanBy(recentSnapshots, ({ lendAprCrv0Boost }) => lendAprCrv0Boost) ?? null,
      maxBoostApr: meanBy(recentSnapshots, ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost) ?? null,
      extraIncentivesApr:
        meanBy(recentSnapshots, ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0)) ?? null,
    }
  }, [lendingSnapshots])

  const extraIncentivesTotalApr = onChainRates?.rewardsApr?.reduce((acc, r) => acc + r.apy, 0) ?? 0
  const rebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.borrowedToken?.rebasingYield // take the most recent rebasing yield
  const supplyApy = onChainRates?.rates?.lendApy ?? marketRate?.rates?.lendApy
  const supplyAprCrvMinBoost = onChainRates?.crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = onChainRates?.crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const totalSupplyRateMinBoost =
    supplyApy == null
      ? null
      : Number(supplyApy) - (rebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMinBoost ?? 0)
  const totalSupplyRateMaxBoost =
    supplyApy == null
      ? null
      : Number(supplyApy) - (rebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMaxBoost ?? 0)
  const totalAverageSupplyRateMinBoost =
    averageAPR?.rate == null
      ? null
      : averageAPR.rate +
        (averageAPR.rebasingYield ?? 0) +
        (averageAPR.extraIncentivesApr ?? 0) +
        (averageAPR.minBoostApr ?? 0)
  const totalAverageSupplyRateMaxBoost =
    averageAPR?.rate == null
      ? null
      : averageAPR.rate +
        (averageAPR.rebasingYield ?? 0) +
        (averageAPR.extraIncentivesApr ?? 0) +
        (averageAPR.maxBoostApr ?? 0)

  const campaignRewards = useMemo(() => {
    if (!campaigns || !market?.addresses?.vault) return []
    return [...(campaigns[market?.addresses?.vault.toLowerCase()] ?? [])]
  }, [campaigns, market?.addresses?.vault])

  return {
    supplyAPY: {
      rate: supplyApy == null ? null : Number(supplyApy),
      averageRate: averageAPR?.rate,
      averageRateLabel: averageMultiplierString,
      rebasingYield: rebasingYield ?? null,
      averageRebasingYield: averageAPR?.rebasingYield ?? null,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: averageAPR?.minBoostApr,
      averageSupplyAprCrvMaxBoost: averageAPR?.maxBoostApr,
      totalSupplyRateMinBoost,
      totalSupplyRateMaxBoost,
      totalAverageSupplyRateMinBoost,
      totalAverageSupplyRateMaxBoost,
      extraIncentives: onChainRates?.rewardsApr
        ? onChainRates?.rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
            address: r.tokenAddress,
          }))
        : [],
      averageTotalExtraIncentivesApr: averageAPR?.extraIncentivesApr,
      extraRewards: campaignRewards,
      loading: islendingSnapshotsLoading || isOnChainRatesLoading || isUserBalancesLoading,
    },
    shares: {
      value: userBalances?.vaultShares ? Number(userBalances.vaultShares) + Number(userBalances.gauge) : null,
      staked: userBalances?.gauge ? Number(userBalances.gauge) : null,
      loading: isUserBalancesLoading,
    },
    supplyAsset: {
      symbol: market?.borrowed_token.symbol,
      address: market?.borrowed_token.address,
      usdRate: suppliedAssetUsdRate,
      depositedAmount:
        marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
          ? +marketPricePerShare * (Number(userBalances.vaultShares) + Number(userBalances.gauge))
          : null,
      depositedUsdValue:
        suppliedAssetUsdRate && marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
          ? +marketPricePerShare *
            (Number(userBalances.vaultShares) + Number(userBalances.gauge)) *
            suppliedAssetUsdRate
          : null,
      loading: isMarketPricePerShareLoading || suppliedAssetUsdRateLoading || isUserBalancesLoading,
    },
  }
}
