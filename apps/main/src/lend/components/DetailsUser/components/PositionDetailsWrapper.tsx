import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { useLendingSnapshots } from '@/lend/entities/lending-snapshots'
import { useTokenUsdRate } from '@/lend/entities/token'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { PositionDetails, type PositionDetailsProps } from '@ui-kit/shared/ui/PositionDetails'

type PositionDetailsWrapperProps = {
  rChainId: ChainId
  market: OneWayMarketTemplate | undefined
  userActiveKey: string
}

export const PositionDetailsWrapper = ({ rChainId, market, userActiveKey }: PositionDetailsWrapperProps) => {
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const isFetchingAll = useStore((state) => state.markets.isFetchingAll)

  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: rChainId,
    tokenAddress: market?.addresses?.collateral_token,
  })

  const { details: userLoanDetails } = userLoanDetailsResp ?? {}

  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[rChainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
  })

  const sevenDayAvgRate = useMemo(() => {
    if (!crvUsdSnapshots) return null

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSnapshots = crvUsdSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > sevenDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ borrowApy }) => borrowApy) * 100
  }, [crvUsdSnapshots])

  const collateralValue = useMemo(() => {
    if (!collateralUsdRate || !userLoanDetails?.state?.collateral) return null
    return (
      Number(userLoanDetails?.state?.collateral) * Number(collateralUsdRate) + Number(userLoanDetails?.state?.borrowed) // assuming crvusd is borrowed
    )
  }, [userLoanDetails?.state?.collateral, userLoanDetails?.state?.borrowed, collateralUsdRate])

  const positionDetailsProps: PositionDetailsProps = {
    app: 'lend',
    isSoftLiquidation: userLoanDetails?.status?.colorKey === 'soft_liquidation',
    health: {
      value: Number(userLoanDetails?.healthFull),
      loading: isFetchingAll ?? true,
    },
    borrowRate: {
      value: sevenDayAvgRate,
      loading: isSnapshotsLoading || !market?.addresses.controller,
    },
    accruedInterest: {
      value: null, // this data point doesn't yet exist on API
      loading: isFetchingAll ?? true,
    },
    liquidationRange: {
      value: userLoanDetails?.prices?.map(Number) ?? null,
      loading: isFetchingAll ?? true,
    },
    liquidationThreshold: {
      value: userLoanDetails?.prices ? Number(userLoanDetails.prices[1]) : null,
      loading: isFetchingAll ?? true,
    },
    collateralValue: {
      value: collateralValue,
      loading: isFetchingAll || collateralUsdRateLoading,
    },
    ltv: {
      value: collateralValue ? (Number(userLoanDetails?.state?.debt) / collateralValue) * 100 : null,
      loading: isFetchingAll ?? true,
    },
    pnl: {
      value: userLoanDetails?.pnl?.currentProfit ? Number(userLoanDetails.pnl.currentProfit) : null,
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

  return <PositionDetails {...positionDetailsProps} />
}
