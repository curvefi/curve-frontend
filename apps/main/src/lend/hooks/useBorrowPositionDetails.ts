import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import { useUserLoanDetails } from '@/lend/entities/user-loan-details'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { BorrowPositionDetailsProps } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

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
  const { data: userLoanDetails, isLoading: isUserLoanDetailsLoading } = useUserLoanDetails({
    chainId,
    marketId,
  })
  const marketRate = useStore((state) => state.markets.ratesMapper[chainId]?.[marketId])
  const prices = useStore((state) => state.markets.pricesMapper[chainId]?.[marketId])

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

    const recentSnapshots = lendSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ borrowApy }) => borrowApy) * 100
  }, [lendSnapshots])

  const borrowApy = onChainRatesData?.rates?.borrowApy ?? marketRate?.rates?.borrowApy

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !userLoanDetails?.state?.collateral) return null
    return (
      Number(userLoanDetails?.state?.collateral) * Number(collateralUsdRate) + Number(userLoanDetails?.state?.borrowed)
    )
  }, [userLoanDetails?.state?.collateral, userLoanDetails?.state?.borrowed, collateralUsdRate])

  return {
    isSoftLiquidation: userLoanDetails?.status?.colorKey === 'soft_liquidation',
    health: {
      value: Number(userLoanDetails?.healthFull),
      loading: !market || isUserLoanDetailsLoading,
    },
    borrowAPY: {
      value: borrowApy != null ? Number(borrowApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRate,
      loading: !market || isOnchainRatesLoading || isLendSnapshotsLoading || !market?.addresses.controller,
    },
    liquidationRange: {
      value: userLoanDetails?.prices ? userLoanDetails.prices.map(Number) : null,
      rangeToLiquidation:
        prices?.prices?.oraclePrice && userLoanDetails?.prices
          ? (Number(userLoanDetails?.prices?.[1]) / Number(prices.prices.oraclePrice)) * 100
          : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    bandRange: {
      value: userLoanDetails?.bands ? userLoanDetails.bands : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: userLoanDetails?.state?.collateral ? Number(userLoanDetails.state.collateral) : null,
        usdRate: collateralUsdRate ?? null,
        symbol: market?.collateral_token?.symbol,
      },
      borrow: {
        value: userLoanDetails?.state?.borrowed ? Number(userLoanDetails.state.borrowed) : null,
        usdRate: borrowedUsdRate ?? null,
        symbol: market?.borrowed_token?.symbol,
      },
      loading: !market || collateralUsdRateLoading || borrowedUsdRateLoading,
    },
    ltv: {
      value: collateralTotalValue ? (Number(userLoanDetails?.state?.debt) / collateralTotalValue) * 100 : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    pnl: {
      currentProfit: userLoanDetails?.pnl?.currentProfit ? Number(userLoanDetails.pnl.currentProfit) : null,
      currentPositionValue: userLoanDetails?.pnl?.currentPosition ? Number(userLoanDetails.pnl.currentPosition) : null,
      depositedValue: userLoanDetails?.pnl?.deposited ? Number(userLoanDetails.pnl.deposited) : null,
      percentageChange: userLoanDetails?.pnl?.percentage ? Number(userLoanDetails.pnl.percentage) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    leverage: {
      value: userLoanDetails?.leverage ? Number(userLoanDetails.leverage) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    totalDebt: {
      value: userLoanDetails?.state?.debt ? Number(userLoanDetails.state.debt) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
  }
}
