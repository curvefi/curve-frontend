import lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import type { BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { calculateLtv, calculateRangeToLiquidation } from '@/llamalend/features/market-position-details/utils'
import { DEFAULT_HEALTH_MODE } from '@/loan/components/PageLoanManage/utils'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { getHealthMode } from '@/loan/utils/health.util'
import { Address } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

type UseLoanPositionDetailsProps = {
  chainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
}

const averageMultiplier = 30
const averageMultiplierString = `${averageMultiplier}D`

export const useLoanPositionDetails = ({
  chainId,
  llamma,
  llammaId,
}: UseLoanPositionDetailsProps): BorrowPositionDetailsProps => {
  const blockchainId = networks[chainId]?.id
  const { data: campaigns } = useCampaigns({ blockchainId })
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
    chainId,
    tokenAddress: llamma?.collateral,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId,
    contractAddress: llamma?.controller as Address,
    agg: 'day',
    limit: 30, // fetch last 30 days for 30 day average calcs
  })

  const { rate: averageRate, rebasingYield: averageRebasingYield } = useMemo(
    () =>
      calculateAverageRates(crvUsdSnapshots, averageMultiplier, {
        rate: ({ rate }) => rate * 100,
        rebasingYield: ({ collateralToken }) => collateralToken.rebasingYield,
      }) ?? { rate: null, rebasingYield: null },
    [crvUsdSnapshots],
  )

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(stablecoin)
  }, [collateral, stablecoin, collateralUsdRate])

  const campaignRewards = useMemo(() => {
    if (!campaigns || !llamma?.controller) return []
    return [...(campaigns[llamma?.controller.toLowerCase()] ?? [])]
  }, [campaigns, llamma?.controller])

  const collateralRebasingYield = crvUsdSnapshots?.[crvUsdSnapshots.length - 1]?.collateralToken.rebasingYield // take only most recent rebasing yield

  return {
    marketType: LlamaMarketType.Mint,
    liquidationAlert: {
      softLiquidation: userStatus?.colorKey === 'soft_liquidation',
      hardLiquidation: userStatus?.colorKey === 'hard_liquidation',
    },
    health: {
      value: Number(healthMode.percent),
      loading: userLoanDetailsLoading ?? true,
    },
    borrowAPY: {
      rate: loanDetails?.parameters?.rate ? Number(loanDetails?.parameters?.rate) : null,
      rebasingYield: collateralRebasingYield ?? null,
      averageRate: averageRate,
      averageRebasingYield: averageRebasingYield ?? null,
      averageRateLabel: averageMultiplierString,
      totalBorrowRate: loanDetails?.parameters?.rate
        ? Number(loanDetails?.parameters?.rate) - (collateralRebasingYield ?? 0)
        : null,
      totalAverageBorrowRate: averageRate == null ? null : averageRate - (averageRebasingYield ?? 0),
      extraRewards: campaignRewards,
      loading: isSnapshotsLoading || (loanDetails?.loading ?? true),
    },
    liquidationRange: {
      value: userPrices ? userPrices.map(Number) : null,
      rangeToLiquidation:
        loanDetails?.priceInfo?.oraclePrice && userPrices
          ? calculateRangeToLiquidation(Number(userPrices?.[1]), Number(loanDetails.priceInfo.oraclePrice))
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
      value: collateralTotalValue && debt ? calculateLtv(Number(debt), collateralTotalValue) : null,
      loading: userLoanDetailsLoading ?? true,
    },
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: userLoanDetailsLoading ?? true,
    },
  }
}
