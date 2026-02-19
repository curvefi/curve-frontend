import lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import {
  calculateRangeToLiquidation,
  type BorrowPositionDetailsProps,
} from '@/llamalend/features/market-position-details'
import { DEFAULT_BORROW_TOKEN_SYMBOL, getHealthMode } from '@/llamalend/health.util'
import { calculateLtv, hasV2Leverage } from '@/llamalend/llama.utils'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { useUserCurrentLeverage } from '@/llamalend/queries/user-current-leverage.query'
import {
  LAST_MONTH,
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
} from '@/llamalend/rates.utils'
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
  const userLoanDetailsLoading = useStore((state) => state.loans.userDetailsMapper[llammaId]?.loading)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])
  const { healthFull, healthNotFull } = useUserLoanDetails(llammaId) ?? {}
  const v2LeverageEnabled = useMemo(() => !!llamma && hasV2Leverage(llamma), [llamma])
  const leverage = useUserCurrentLeverage({ chainId, marketId: llammaId, userAddress })

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
    limit: LAST_MONTH, // fetch last 30 days for 30 day average calcs
  })

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(stablecoin)
  }, [collateral, stablecoin, collateralUsdRate])

  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)
  const {
    averageRate: averageBorrowApr,
    averageRebasingYield: averageRebasingYieldApr,
    totalRate: totalBorrowApr,
    averageTotalRate: totalAverageBorrowApr,
    rebasingYield: collateralRebasingYieldApr,
  } = useMemo(
    () =>
      getBorrowRateMetrics({
        borrowRate: borrowApr,
        snapshots: crvUsdSnapshots,
        getBorrowRate: getSnapshotBorrowRate,
        getRebasingYield: getSnapshotCollateralRebasingYieldRate,
      }),
    [borrowApr, crvUsdSnapshots],
  )

  /** Loading checks include a null check on value to cover the gap where legacy stores have no loading state yet.
   * TODO: remove once migrated to direct llamalend-js queries */
  return {
    marketType: LlamaMarketType.Mint,
    liquidationAlert: {
      softLiquidation: userStatus?.colorKey === 'soft_liquidation',
      hardLiquidation: userStatus?.colorKey === 'hard_liquidation',
    },
    health: {
      value: healthMode.percent !== '' ? Number(healthMode.percent) : null,
      loading: healthMode.percent === '' || userLoanDetailsLoading || !isHydrated,
    },
    borrowRate: {
      rate: borrowApr,
      rebasingYield: collateralRebasingYieldApr ?? null,
      averageRate: averageBorrowApr,
      averageRebasingYield: averageRebasingYieldApr ?? null,
      averageRateLabel: `${LAST_MONTH}D`,
      totalBorrowRate: totalBorrowApr,
      totalAverageBorrowRate: totalAverageBorrowApr,
      extraRewards: campaigns,
      loading: borrowApr == null || isSnapshotsLoading || isMarketRatesLoading || !isHydrated,
    },
    liquidationRange: {
      value: userPrices ? userPrices.map(Number) : null,
      rangeToLiquidation:
        loanDetails?.priceInfo?.oraclePrice && userPrices
          ? calculateRangeToLiquidation(Number(userPrices?.[1]), Number(loanDetails.priceInfo.oraclePrice))
          : null,
      loading: userPrices == null || userLoanDetailsLoading || !isHydrated,
    },
    bandRange: {
      value: userBands ? userBands : null,
      loading: userBands == null || userLoanDetailsLoading || !isHydrated,
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
      loading:
        collateral == null ||
        userLoanDetailsLoading ||
        collateralUsdRateLoading ||
        borrowedUsdRateLoading ||
        !isHydrated,
    },
    ltv: {
      value:
        collateralTotalValue && debt
          ? calculateLtv(Number(debt), Number(collateral), Number(stablecoin), borrowedUsdRate, collateralUsdRate)
          : null,
      loading: debt == null || userLoanDetailsLoading || !isHydrated,
    },
    ...(v2LeverageEnabled && {
      leverage: {
        value: leverage.data ? Number(leverage.data) : null,
        loading: leverage.isLoading || !isHydrated,
      },
    }),
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: debt == null || userLoanDetailsLoading || !isHydrated,
    },
  }
}
