import lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { getHealthMode } from '@/loan/components/DetailInfoHealth'
import { DEFAULT_HEALTH_MODE } from '@/loan/components/PageLoanManage/utils'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address } from '@curvefi/prices-api'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { BorrowPositionDetailsProps } from '@ui-kit/features/market-position-details/BorrowPositionDetails'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseLoanPositionDetailsProps = {
  chainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
}

export const useLoanPositionDetails = ({
  chainId,
  llamma,
  llammaId,
}: UseLoanPositionDetailsProps): BorrowPositionDetailsProps => {
  const {
    userState: { collateral, stablecoin, debt } = {},
    userPrices,
    userBands,
    userStatus,
    loading: userLoanDetailsLoading,
  } = useStore((state) => state.loans.userDetailsMapper[llammaId]) ?? {}
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])
  const { healthFull, healthNotFull } = useUserLoanDetails(llammaId) ?? {}
  const { oraclePriceBand } = loanDetails ?? {}

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)

  useEffect(() => {
    if (!lodash.isUndefined(oraclePriceBand) && healthFull && healthNotFull && userBands) {
      const fetchedHealthMode = getHealthMode(
        oraclePriceBand,
        '',
        userBands,
        '',
        healthFull,
        healthNotFull,
        false,
        '',
        '',
      )
      setHealthMode(fetchedHealthMode)
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [oraclePriceBand, healthFull, healthNotFull, userBands])

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

    return lodash.meanBy(recentSnapshots, ({ rate }) => rate) * 100
  }, [crvUsdSnapshots])

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(stablecoin)
  }, [collateral, stablecoin, collateralUsdRate])

  return {
    liquidationAlert: {
      softLiquidation: userStatus?.colorKey === 'soft_liquidation',
      hardLiquidation: userStatus?.colorKey === 'hard_liquidation',
    },
    health: {
      value: Number(healthMode.percent),
      loading: userLoanDetailsLoading ?? true,
    },
    borrowAPY: {
      value: loanDetails?.parameters?.rate ? Number(loanDetails?.parameters?.rate) : null,
      thirtyDayAvgRate: thirtyDayAvgRate,
      loading: isSnapshotsLoading || (loanDetails?.loading ?? true),
    },
    liquidationRange: {
      value: userPrices ? userPrices.map(Number) : null,
      rangeToLiquidation:
        loanDetails?.priceInfo?.oraclePrice && userPrices
          ? (Number(userPrices?.[1]) / Number(loanDetails.priceInfo.oraclePrice)) * 100
          : null,
      loading: userLoanDetailsLoading ?? true,
    },
    bandRange: {
      value: userBands ? userBands : null,
      loading: userLoanDetailsLoading ?? true,
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: collateral ? Number(collateral) : null,
        usdRate: collateralUsdRate ? Number(collateralUsdRate) : null,
        symbol: llamma?.collateralSymbol,
      },
      borrow: {
        value: stablecoin ? Number(stablecoin) : null,
        usdRate: borrowedUsdRate ? Number(borrowedUsdRate) : null,
        symbol: 'crvUSD',
      },
      loading: (userLoanDetailsLoading ?? true) || collateralUsdRateLoading || borrowedUsdRateLoading,
    },
    ltv: {
      value: collateralTotalValue && debt ? (Number(debt) / collateralTotalValue) * 100 : null,
      loading: userLoanDetailsLoading ?? true,
    },
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: userLoanDetailsLoading ?? true,
    },
  }
}
