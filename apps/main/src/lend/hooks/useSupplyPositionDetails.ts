import { meanBy } from 'lodash'
import { useMemo } from 'react'
import { useMarketOnChainRates, useMarketPricePerShare } from '@/lend/entities/market-details'
import { useUserMarketBalances } from '@/lend/entities/user-market-balances'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useQuery } from '@tanstack/react-query'
import { getCampaignsOptions } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { SupplyPositionDetailsProps } from '@ui-kit/features/market-position-details/SupplyPositionDetails'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseSupplyPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

export const useSupplyPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseSupplyPositionDetailsProps): SupplyPositionDetailsProps => {
  const { data: campaigns } = useQuery(getCampaignsOptions({}, true))
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
  })

  const thirtyDayAvgSupplyApr = useMemo(() => {
    if (!lendingSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = lendingSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ lendApr }) => lendApr) * 100
  }, [lendingSnapshots])

  const supplyApy = onChainRates?.rates?.lendApy ?? marketRate?.rates?.lendApy
  const supplyAprCrvMinBoost = onChainRates?.crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = onChainRates?.crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0

  const campaignRewards = useMemo(() => {
    if (!campaigns || !market?.addresses?.vault) return []
    return [...(campaigns[market?.addresses?.vault.toLowerCase()] ?? [])]
  }, [campaigns, market?.addresses?.vault])

  return {
    supplyAPY: {
      rate: supplyApy != null ? Number(supplyApy) : null,
      averageRate: thirtyDayAvgSupplyApr,
      averageRateLabel: '30D',
      rebasingYield: lendingSnapshots?.[0]?.borrowedToken?.rebasingYield,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      extraIncentives: [],
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
