import { meanBy } from 'lodash'
import { useMemo } from 'react'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import { useMarketPricePerShare } from '@/lend/entities/market-price-per-share'
import { useUserMarketBalances } from '@/lend/entities/user-market-balances'
import useSupplyTotalApr from '@/lend/hooks/useSupplyTotalApr'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { LendPositionDetailsProps } from '@ui-kit/features/market-position-details/LendPositionDetails'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseLendPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

export const useLendPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseLendPositionDetailsProps): LendPositionDetailsProps => {
  const { data: userBalances, isLoading: isUserBalancesLoading } = useUserMarketBalances({ chainId, marketId })
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[marketId])
  const { totalApr } = useSupplyTotalApr(chainId, marketId)
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketPricePerShare({
    chainId: chainId,
    marketId,
  })
  const { data: onChainRates, isLoading: isOnChainRatesLoading } = useMarketOnChainRates({
    chainId,
    marketId,
  })
  const { data: lentAssetUsdRate, isLoading: lentAssetUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })
  const { data: lendSnapshots, isLoading: isLendSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
  })

  const thirtyDayAvgLendApr = useMemo(() => {
    if (!lendSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = lendSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ lendApr }) => lendApr) * 100
  }, [lendSnapshots])

  const lendApy = onChainRates?.rates?.lendApy ?? marketRate?.rates?.lendApy

  return {
    lendingAPY: {
      value: lendApy != null ? Number(lendApy) : null,
      maxApy: totalApr.max != null ? Number(totalApr.max) : null,
      thirtyDayAvgRate: thirtyDayAvgLendApr,
      loading: isLendSnapshotsLoading || isOnChainRatesLoading || isUserBalancesLoading,
    },
    shares: {
      value: userBalances?.vaultShares ? Number(userBalances.vaultShares) + Number(userBalances.gauge) : null,
      staked: userBalances?.gauge ? Number(userBalances.gauge) : null,
      loading: isUserBalancesLoading,
    },
    lentAsset: {
      symbol: market?.borrowed_token.symbol,
      address: market?.borrowed_token.address,
      usdRate: lentAssetUsdRate,
      depositedAmount:
        marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
          ? +marketPricePerShare * (Number(userBalances.vaultShares) + Number(userBalances.gauge))
          : null,
      depositedUsdValue:
        lentAssetUsdRate && marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
          ? +marketPricePerShare * (Number(userBalances.vaultShares) + Number(userBalances.gauge)) * lentAssetUsdRate
          : null,
      loading: isMarketPricePerShareLoading || lentAssetUsdRateLoading || isUserBalancesLoading,
    },
  }
}
