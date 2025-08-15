import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useMarketOnChainRates } from '@/lend/entities/market-details'
import { useUserLoanDetails } from '@/lend/entities/user-loan-details'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { BorrowPositionDetailsProps } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { calculateLtv, calculateRangeToLiquidation } from '@ui-kit/features/market-position-details/utils'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'

type UseBorrowPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

export const useBorrowPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseBorrowPositionDetailsProps): BorrowPositionDetailsProps => {
  const { controller } = market?.addresses ?? {}
  const { address: userAddress } = useAccount()
  const { data: userLoanDetails, isLoading: isUserLoanDetailsLoading } = useUserLoanDetails({
    chainId,
    marketId,
    userAddress,
  })
  const {
    bands,
    healthFull,
    leverage,
    pnl,
    prices: liquidationPrices,
    status,
    state: { collateral, borrowed, debt } = {},
  } = userLoanDetails ?? {}
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[marketId])
  const prices = useStore((state) => state.markets.pricesMapper[chainId]?.[marketId])

  const { data: campaigns } = useCampaigns({})
  const { data: onChainRatesData, isLoading: isOnchainRatesLoading } = useMarketOnChainRates({
    chainId: chainId,
    marketId,
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: market?.addresses?.collateral_token,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })
  const { data: lendSnapshots, isLoading: isLendSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
  })

  const thirtyDayAvgRate = useMemo(() => {
    if (!lendSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = lendSnapshots.filter((snapshot) => snapshot.timestamp > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ borrowApy }) => borrowApy) * 100
  }, [lendSnapshots])

  const borrowApy = onChainRatesData?.rates?.borrowApy ?? marketRate?.rates?.borrowApy ?? null
  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral || !borrowed) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(borrowed)
  }, [collateral, borrowed, collateralUsdRate])
  const campaignRewards = useMemo(() => {
    if (!campaigns || !controller) return []
    return [...(campaigns[controller.toLowerCase()] ?? [])]
  }, [campaigns, controller])

  const rebasingYield = lendSnapshots?.[0]?.collateralToken?.rebasingYield // take most recent rebasing yield
  return {
    marketType: LlamaMarketType.Lend,
    liquidationAlert: {
      softLiquidation: status?.colorKey === 'soft_liquidation',
      hardLiquidation: status?.colorKey === 'hard_liquidation',
    },
    health: {
      value: healthFull ? Number(healthFull) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    borrowAPY: {
      rate: borrowApy == null ? null : Number(borrowApy),
      averageRate: thirtyDayAvgRate,
      averageRateLabel: '30D',
      rebasingYield: rebasingYield ?? null,
      totalBorrowRate: borrowApy == null ? null : Number(borrowApy) - (rebasingYield ?? 0),
      extraRewards: campaignRewards,
      loading: !market || isOnchainRatesLoading || isLendSnapshotsLoading || !market?.addresses.controller,
    },
    liquidationRange: {
      value: liquidationPrices ? liquidationPrices.map(Number) : null,
      rangeToLiquidation:
        prices?.prices?.oraclePrice && liquidationPrices
          ? calculateRangeToLiquidation(Number(liquidationPrices?.[1]), Number(prices.prices.oraclePrice))
          : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    bandRange: {
      value: bands,
      loading: !market || isUserLoanDetailsLoading,
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: collateral ? Number(collateral) : null,
        usdRate: collateralUsdRate ?? null,
        symbol: market?.collateral_token?.symbol,
      },
      borrow: {
        value: borrowed ? Number(borrowed) : null,
        usdRate: borrowedUsdRate ?? null,
        symbol: market?.borrowed_token?.symbol,
      },
      loading: !market || isUserLoanDetailsLoading || collateralUsdRateLoading || borrowedUsdRateLoading,
    },
    ltv: {
      value: collateralTotalValue && debt ? calculateLtv(Number(debt), collateralTotalValue) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    pnl: {
      currentProfit: pnl?.currentProfit ? Number(pnl.currentProfit) : null,
      currentPositionValue: pnl?.currentPosition ? Number(pnl.currentPosition) : null,
      depositedValue: pnl?.deposited ? Number(pnl.deposited) : null,
      percentageChange: pnl?.percentage ? Number(pnl.percentage) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    leverage: {
      value: leverage ? Number(leverage) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
  }
}
