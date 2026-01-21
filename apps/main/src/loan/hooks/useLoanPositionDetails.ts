import lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import type { BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { calculateRangeToLiquidation } from '@/llamalend/features/market-position-details/utils'
import { DEFAULT_BORROW_TOKEN_SYMBOL, getHealthMode } from '@/llamalend/health.util'
import { calculateLtv, hasV2Leverage } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useUserPnl } from '@/llamalend/queries/user-pnl.query'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'
import { decimal } from '@ui-kit/utils/decimal'

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
  const { isHydrated } = useCurve()
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({ chainId, marketId: llammaId })
  const blockchainId = networks[chainId]?.id
  const { address: userAddress } = useConnection()
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: llamma?.controller?.toLocaleLowerCase() as Address,
  })
  const { collateral, stablecoin, debt } = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userState) ?? {}
  const userPrices = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userPrices)
  const userBands = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userBands)
  const userStatus = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userStatus)
  const userLoss = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userLoss)
  const userLoanDetailsLoading = useStore((state) => state.loans.userDetailsMapper[llammaId]?.loading)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])
  const { healthFull, healthNotFull } = useUserLoanDetails(llammaId) ?? {}
  const v2LeverageEnabled = useMemo(() => !!llamma && hasV2Leverage(llamma), [llamma])

  const { data: loanExists } = useLoanExists({
    chainId,
    marketId: llammaId,
    userAddress,
  })
  const { data: userPnl, isLoading: isUserPnlLoading } = useUserPnl({
    chainId,
    marketId: llammaId,
    userAddress,
    loanExists,
    hasV2Leverage: v2LeverageEnabled,
  })
  const { oraclePriceBand } = loanDetails ?? {}

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)

  useEffect(() => {
    if (!lodash.isUndefined(oraclePriceBand) && healthFull && healthNotFull && userBands) {
      const fetchedHealthMode = getHealthMode(
        DEFAULT_BORROW_TOKEN_SYMBOL,
        oraclePriceBand,
        '',
        userBands,
        '',
        healthFull,
        healthNotFull,
        '',
        '',
      )
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const collateralRebasingYield = crvUsdSnapshots?.[crvUsdSnapshots.length - 1]?.collateralToken.rebasingYield // take only most recent rebasing yield
  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)

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
    borrowRate: {
      rate: borrowApr,
      rebasingYield: collateralRebasingYield ?? null,
      averageRate: averageRate,
      averageRebasingYield: averageRebasingYield ?? null,
      averageRateLabel: averageMultiplierString,
      totalBorrowRate: borrowApr ? borrowApr - (collateralRebasingYield ?? 0) : null,
      totalAverageBorrowRate: averageRate == null ? null : averageRate - (averageRebasingYield ?? 0),
      extraRewards: campaigns,
      loading: isSnapshotsLoading || isMarketRatesLoading || !isHydrated,
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
      value:
        collateralTotalValue && debt
          ? calculateLtv(Number(debt), Number(collateral), Number(stablecoin), borrowedUsdRate, collateralUsdRate)
          : null,
      loading: userLoanDetailsLoading ?? true,
    },
    pnl: v2LeverageEnabled
      ? {
          currentProfit: userPnl?.currentProfit,
          currentPositionValue: userPnl?.currentPosition,
          depositedValue: userPnl?.deposited,
          percentageChange: userPnl?.percentage,
          loading: isUserPnlLoading ?? true,
        }
      : undefined,
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: userLoanDetailsLoading ?? true,
    },
    collateralLoss: {
      depositedCollateral: decimal(userLoss?.deposited_collateral),
      currentCollateralEstimation: decimal(userLoss?.current_collateral_estimation),
      percentage: decimal(userLoss?.loss_pct),
      amount: decimal(userLoss?.loss),
      loading: userLoanDetailsLoading ?? true,
    },
  }
}
