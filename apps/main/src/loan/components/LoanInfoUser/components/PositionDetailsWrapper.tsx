import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useCrvUsdSnapshots } from '@/loan/entities/crvusd-snapshots'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import type { Address } from '@curvefi/prices-api'
import { PositionDetails, type PositionDetailsProps } from '@ui-kit/shared/ui/PositionDetails'

type PositionDetailsWrapperProps = {
  rChainId: ChainId
  llamma: Llamma | null
  llammaId: string
  health: string
}

export const PositionDetailsWrapper = ({ rChainId, llamma, llammaId, health }: PositionDetailsWrapperProps) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const usdRatesLoading = useStore((state) => state.usdRates.loading)
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[llamma?.collateral ?? ''])
  const borrowedUsdRate = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])

  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId: networks[rChainId].id,
    contractAddress: llamma?.controller as Address,
  })

  const sevenDayAvgRate = useMemo(() => {
    if (!crvUsdSnapshots) return null

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSnapshots = crvUsdSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > sevenDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ rate }) => rate) * 100
  }, [crvUsdSnapshots])

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !userLoanDetails?.userState?.collateral) return null
    return (
      Number(userLoanDetails?.userState?.collateral) * Number(collateralUsdRate) +
      Number(userLoanDetails?.userState?.stablecoin)
    )
  }, [userLoanDetails?.userState?.collateral, userLoanDetails?.userState?.stablecoin, collateralUsdRate])

  const positionDetailsProps: PositionDetailsProps = {
    app: 'mint',
    isSoftLiquidation: userLoanDetails?.userStatus?.colorKey === 'soft_liquidation',
    health: {
      value: Number(health),
      loading: userLoanDetails?.loading ?? true,
    },
    borrowRate: {
      value: sevenDayAvgRate,
      loading: isSnapshotsLoading || !llamma?.controller,
    },
    accruedInterest: {
      value: null, // this data point doesn't yet exist on API
      loading: userLoanDetails?.loading ?? true,
    },
    liquidationRange: {
      value: userLoanDetails?.userPrices?.map(Number) ?? null,
      loading: userLoanDetails?.loading ?? true,
    },
    liquidationThreshold: {
      value: userLoanDetails?.userPrices ? Number(userLoanDetails.userPrices[1]) : null,
      loading: userLoanDetails?.loading ?? true,
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: userLoanDetails?.userState?.collateral ? Number(userLoanDetails.userState.collateral) : null,
        usdRate: collateralUsdRate ? Number(collateralUsdRate) : null,
        symbol: llamma?.collateralSymbol,
      },
      borrow: {
        value: userLoanDetails?.userState?.stablecoin ? Number(userLoanDetails.userState.stablecoin) : null,
        usdRate: borrowedUsdRate ? Number(borrowedUsdRate) : null,
        symbol: 'crvUSD',
      },
      loading: (userLoanDetails?.loading ?? true) || usdRatesLoading,
    },
    ltv: {
      value: collateralTotalValue ? (Number(userLoanDetails?.userState?.debt) / collateralTotalValue) * 100 : null,
      loading: userLoanDetails?.loading ?? true,
    },
    totalDebt: {
      value: userLoanDetails?.userState?.debt ? Number(userLoanDetails.userState.debt) : null,
      loading: userLoanDetails?.loading ?? true,
    },
  }

  return <PositionDetails {...positionDetailsProps} />
}
