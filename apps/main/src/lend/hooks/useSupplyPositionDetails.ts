import { useMemo } from 'react'
import { networks } from '@/lend/networks'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { SupplyPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { useMarketVaultOnChainRewards, useMarketVaultPricePerShare } from '@/llamalend/queries/market'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import { useUserMarketBalances, useUserSupplyBoost } from '@/llamalend/queries/user'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
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
  const { isHydrated } = useCurve()
  const blockchainId = networks[chainId].id as Chain
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.addresses?.vault?.toLocaleLowerCase() as Address,
  })
  const { data: userBalances, isLoading: isUserBalancesLoading } = useUserMarketBalances({ chainId, marketId })
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketVaultPricePerShare({
    chainId,
    marketId,
  })
  const { data: userSupplyBoost, isLoading: isUserSupplyBoostLoading } = useUserSupplyBoost({
    chainId,
    marketId,
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
    limit: averageMultiplier, // fetch last 30 days for 30 day average calcs
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

  const rebasingYield = lendingSnapshots?.[lendingSnapshots.length - 1]?.borrowedToken?.rebasingYield // take the most recent rebasing yield
  const supplyApy = marketRates?.lendApy == null ? null : Number(marketRates.lendApy)
  const supplyAprCrvMinBoost = onChainRewards?.crvRates?.[0] ?? lendingSnapshots?.[0]?.lendAprCrv0Boost ?? 0
  const supplyAprCrvMaxBoost = onChainRewards?.crvRates?.[1] ?? lendingSnapshots?.[0]?.lendAprCrvMaxBoost ?? 0
  const userCurrentCRVApr = (supplyAprCrvMinBoost ?? 0) * (userSupplyBoost ?? 1)
  const extraIncentivesTotalApr = onChainRewards?.rewardsApr?.reduce((acc, r) => acc + r.apy, 0) ?? 0
  const userTotalCurrentSupplyApr =
    supplyApy && supplyApy + (rebasingYield ?? 0) + extraIncentivesTotalApr + userCurrentCRVApr
  const totalSupplyRateMinBoost =
    supplyApy && supplyApy + (rebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMinBoost ?? 0)
  const totalSupplyRateMaxBoost =
    supplyApy && supplyApy + (rebasingYield ?? 0) + extraIncentivesTotalApr + (supplyAprCrvMaxBoost ?? 0)
  const totalAverageSupplyRateMinBoost =
    averageRate &&
    averageRate +
      (averageRebasingYield ?? 0) +
      (averageTotalExtraIncentivesApr ?? 0) +
      (averageSupplyAprCrvMinBoost ?? 0)
  const totalAverageSupplyRateMaxBoost =
    averageRate &&
    averageRate +
      (averageRebasingYield ?? 0) +
      (averageTotalExtraIncentivesApr ?? 0) +
      (averageSupplyAprCrvMaxBoost ?? 0)

  const sharesValue = userBalances?.vaultShares ? Number(userBalances.vaultShares) + Number(userBalances.gauge) : null
  const depositedAmount =
    marketPricePerShare && userBalances?.vaultShares && userBalances?.gauge
      ? Number(marketPricePerShare) * (Number(userBalances.vaultShares) + Number(userBalances.gauge))
      : null

  return {
    userSupplyRate: {
      rate: supplyApy,
      averageRate,
      averageRateLabel: averageMultiplierString,
      rebasingYield: rebasingYield ?? null,
      averageRebasingYield: averageRebasingYield ?? null,
      userCurrentCRVApr,
      userTotalCurrentSupplyApr,
      supplyAprCrvMinBoost,
      supplyAprCrvMaxBoost,
      averageSupplyAprCrvMinBoost: averageSupplyAprCrvMinBoost ?? null,
      averageSupplyAprCrvMaxBoost: averageSupplyAprCrvMaxBoost ?? null,
      totalSupplyRateMinBoost,
      totalSupplyRateMaxBoost,
      totalAverageSupplyRateMinBoost,
      totalAverageSupplyRateMaxBoost,
      extraIncentives: onChainRewards?.rewardsApr
        ? onChainRewards?.rewardsApr.map((r) => ({
            title: r.symbol,
            percentage: r.apy,
            blockchainId,
            address: r.tokenAddress,
          }))
        : [],
      averageTotalExtraIncentivesApr: averageTotalExtraIncentivesApr ?? null,
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
