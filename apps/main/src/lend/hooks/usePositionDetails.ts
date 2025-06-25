import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useLendingSnapshots } from '@/lend/entities/lending-snapshots'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import { useTokenUsdRate } from '@/lend/entities/token'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { PositionDetailsProps } from '@ui-kit/shared/ui/PositionDetails'

type UsePositionDetailsProps = {
  rChainId: ChainId
  market: OneWayMarketTemplate | undefined
  marketId: string
  userActiveKey: string
}

export const usePositionDetails = ({
  rChainId,
  market,
  marketId,
  userActiveKey,
}: UsePositionDetailsProps): PositionDetailsProps => {
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const isFetchingAll = useStore((state) => state.markets.isFetchingAll)
  const marketRate = useStore((state) => state.markets.ratesMapper[rChainId]?.[marketId])
  const prices = useStore((state) => state.markets.pricesMapper[rChainId]?.[marketId])

  const { data: onchainData, isLoading: isOnchainRatesLoading } = useMarketOnChainRates({ chainId: rChainId, marketId })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: rChainId,
    tokenAddress: market?.addresses?.collateral_token,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: rChainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })

  const { details: userLoanDetails } = userLoanDetailsResp ?? {}

  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[rChainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
  })

  const thirtyDayAvgRate = useMemo(() => {
    if (!crvUsdSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = crvUsdSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ borrowApy }) => borrowApy) * 100
  }, [crvUsdSnapshots])

  const borrowApy = onchainData?.rates?.borrowApy ?? marketRate?.rates?.borrowApy

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !userLoanDetails?.state?.collateral) return null
    return (
      Number(userLoanDetails?.state?.collateral) * Number(collateralUsdRate) + Number(userLoanDetails?.state?.borrowed)
    )
  }, [userLoanDetails?.state?.collateral, userLoanDetails?.state?.borrowed, collateralUsdRate])

  return {
    app: 'lend',
    isSoftLiquidation: userLoanDetails?.status?.colorKey === 'soft_liquidation',
    health: {
      value: Number(userLoanDetails?.healthFull),
      loading: isFetchingAll ?? true,
    },
    borrowRate: {
      value: borrowApy != null ? Number(borrowApy) : null,
      thirtyDayAvgRate: thirtyDayAvgRate,
      loading: isOnchainRatesLoading || isSnapshotsLoading || !market?.addresses.controller,
    },
    liquidationRange: {
      value: userLoanDetails?.prices ? userLoanDetails.prices.map(Number) : null,
      rangeToLiquidation:
        prices?.prices?.oraclePrice && userLoanDetails?.prices
          ? (Number(userLoanDetails?.prices?.[1]) / Number(prices.prices.oraclePrice)) * 100
          : null,
      loading: isFetchingAll ?? true,
    },
    bandRange: {
      value: userLoanDetails?.bands ? userLoanDetails.bands : null,
      loading: isFetchingAll ?? true,
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
      loading: isFetchingAll || collateralUsdRateLoading || borrowedUsdRateLoading,
    },
    ltv: {
      value: collateralTotalValue ? (Number(userLoanDetails?.state?.debt) / collateralTotalValue) * 100 : null,
      loading: isFetchingAll ?? true,
    },
    pnl: {
      currentProfit: userLoanDetails?.pnl?.currentProfit ? Number(userLoanDetails.pnl.currentProfit) : null,
      currentPositionValue: userLoanDetails?.pnl?.currentPosition ? Number(userLoanDetails.pnl.currentPosition) : null,
      depositedValue: userLoanDetails?.pnl?.deposited ? Number(userLoanDetails.pnl.deposited) : null,
      percentageChange: userLoanDetails?.pnl?.percentage ? Number(userLoanDetails.pnl.percentage) : null,
      loading: isFetchingAll ?? true,
    },
    leverage: {
      value: userLoanDetails?.leverage ? Number(userLoanDetails.leverage) : null,
      loading: isFetchingAll ?? true,
    },
    totalDebt: {
      value: userLoanDetails?.state?.debt ? Number(userLoanDetails.state.debt) : null,
      loading: isFetchingAll ?? true,
    },
  }
}
