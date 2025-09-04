import { useMemo } from 'react'
import { useMarketOnChainRates, useMarketPricePerShare } from '@/lend/entities/market-details'
import { useUserMarketBalances } from '@/lend/entities/user-market-balances'
import { useUserSupplyBoost } from '@/lend/entities/user-supply-boost'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { SupplyPositionDetailsProps } from '@ui-kit/features/market-position-details/SupplyPositionDetails'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

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
    chainId,
    marketId,
  })
  const { data: userSupplyBoost, isLoading: isUserSupplyBoostLoading } = useUserSupplyBoost({
    chainId,
    marketId,
  })
  const { data: onChainRates, isLoading: isOnChainRatesLoading } = useMarketOnChainRates({
    chainId,
    marketId,
  })
  const { data: suppliedAssetUsdRate, isLoading: suppliedAssetUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })
  const { data: lendingSnapshots, isLoading: islendingSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
    agg: 'day',
    limit: 30, // fetch last 30 days for 30 day average calcs
  })

  const {
    rate: averageRate,
    rebasingYield: averageRebasingYield,
    minBoostApr: averageSupplyAprCrvMinBoost,
    maxBoostApr: averageSupplyAprCrvMaxBoost,
    extraIncentivesApr: averageTotalExtraIncentivesApr,
  } = useMemo(
    () =>
      calculateAverageRates(lendingSnapshots, averageMultiplier, {
        rate: ({ lendApr }) => lendApr * 100,
        rebasingYield: ({ borrowedToken }) => borrowedToken.rebasingYield,
        minBoostApr: ({ lendAprCrv0Boost }) => lendAprCrv0Boost,
        maxBoostApr: ({ lendAprCrvMaxBoost }) => lendAprCrvMaxBoost,
        extraIncentivesApr: ({ extraRewardApr }) => extraRewardApr.reduce((acc, r) => acc + r.rate, 0),
      }) ?? {
        rate: null,
        rebasingYield: null,
        minBoostApr: null,
        maxBoostApr: null,
        extraIncentivesApr: null,
      },
    [lendingSnapshots],
  )

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
    averageRate == null
      ? null
      : averageRate +
        (averageRebasingYield ?? 0) +
        (averageTotalExtraIncentivesApr ?? 0) +
        (averageSupplyAprCrvMinBoost ?? 0)
  const totalAverageSupplyRateMaxBoost =
    averageRate == null
      ? null
      : averageRate +
        (averageRebasingYield ?? 0) +
        (averageTotalExtraIncentivesApr ?? 0) +
        (averageSupplyAprCrvMaxBoost ?? 0)

  const campaignRewards = useMemo(() => {
    if (!campaigns || !market?.addresses?.vault) return []
    return [...(campaigns[market?.addresses?.vault.toLowerCase()] ?? [])]
  }, [campaigns, market?.addresses?.vault])

  return {
    supplyAPY: {
      rate: supplyApy == null ? null : Number(supplyApy),
      averageRate: averageRate,
      averageRateLabel: averageMultiplierString,
      rebasingYield: rebasingYield ?? null,
      averageRebasingYield: averageRebasingYield ?? null,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: averageSupplyAprCrvMinBoost ?? null,
      averageSupplyAprCrvMaxBoost: averageSupplyAprCrvMaxBoost ?? null,
      totalSupplyRateMinBoost,
      totalSupplyRateMaxBoost,
      totalAverageSupplyRateMinBoost,
      totalAverageSupplyRateMaxBoost,
      extraIncentives: onChainRates?.rewardsApr
        ? onChainRates?.rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId: networks[chainId]?.id as Chain,
            address: r.tokenAddress,
          }))
        : [],
      averageTotalExtraIncentivesApr: averageTotalExtraIncentivesApr ?? null,
      extraRewards: campaignRewards,
      loading: islendingSnapshotsLoading || isOnChainRatesLoading || isUserBalancesLoading,
    },
    boost: {
      value: userSupplyBoost,
      loading: isUserSupplyBoostLoading,
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
