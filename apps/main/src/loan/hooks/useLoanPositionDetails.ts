import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address } from '@curvefi/prices-api'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { BorrowPositionDetailsProps } from '@ui-kit/shared/ui/PositionDetails/BorrowPositionDetails'

type UseLoanPositionDetailsProps = {
  chainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
  health: string | undefined
}

export const useLoanPositionDetails = ({
  chainId,
  llamma,
  llammaId,
  health,
}: UseLoanPositionDetailsProps): BorrowPositionDetailsProps => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])

  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: llamma?.collateral,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId: networks[chainId as keyof typeof networks].id,
    contractAddress: llamma?.controller as Address,
  })

  const thirtyDayAvgRate = useMemo(() => {
    if (!crvUsdSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = crvUsdSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

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

  return {
    isSoftLiquidation: userLoanDetails?.userStatus?.colorKey === 'soft_liquidation',
    health: {
      value: Number(health),
      loading: userLoanDetails?.loading ?? true,
    },
    borrowAPR: {
      value: loanDetails?.parameters?.rate ? Number(loanDetails?.parameters?.rate) : null,
      thirtyDayAvgRate: thirtyDayAvgRate,
      loading: isSnapshotsLoading || (loanDetails?.loading ?? true),
    },
    liquidationRange: {
      value: userLoanDetails?.userPrices ? userLoanDetails.userPrices.map(Number) : null,
      rangeToLiquidation:
        loanDetails?.priceInfo?.oraclePrice && userLoanDetails?.userPrices
          ? (Number(userLoanDetails?.userPrices?.[1]) / Number(loanDetails.priceInfo.oraclePrice)) * 100
          : null,
      loading: userLoanDetails?.loading ?? true,
    },
    bandRange: {
      value: userLoanDetails?.userBands ? userLoanDetails.userBands : null,
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
      loading: (userLoanDetails?.loading ?? true) || collateralUsdRateLoading || borrowedUsdRateLoading,
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
}
