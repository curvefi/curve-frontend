import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  calculateRangeToLiquidation,
  type BorrowPositionDetailsProps,
} from '@/llamalend/features/market-position-details'
import { calculateLtv, getIsUserCloseToLiquidation, getLiquidationStatus, hasV2Leverage } from '@/llamalend/llama.utils'
import { useMarketLiquidationBand } from '@/llamalend/queries/market-liquidation-band.query'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market-oracle-price-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import {
  useUserBands,
  useUserCurrentLeverage,
  useUserHealth,
  useUserLoss,
  useUserPrices,
  useUserState,
} from '@/llamalend/queries/user'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { networks } from '@/loan/networks'
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
  market: Llamma | null | undefined
  marketId: string
}

const averageMultiplier = 30
const averageMultiplierString = `${averageMultiplier}D`

export const useLoanPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseLoanPositionDetailsProps): BorrowPositionDetailsProps => {
  const { isHydrated } = useCurve()
  const blockchainId = networks[chainId]?.id
  const { address: userAddress } = useConnection()

  const userMarketParams = { chainId, marketId, userAddress }
  const marketParams = { chainId, marketId }

  // User queries (fire in parallel)
  const { data: userState, isLoading: isUserStateLoading } = useUserState(userMarketParams)
  const { data: healthFull, isLoading: isHealthFullLoading } = useUserHealth({ ...userMarketParams, isFull: true })
  const { data: healthNotFull, isLoading: isHealthNotFullLoading } = useUserHealth({
    ...userMarketParams,
    isFull: false,
  })
  const { data: userBands, isLoading: isUserBandsLoading } = useUserBands(userMarketParams)
  const { data: userPrices, isLoading: isUserPricesLoading } = useUserPrices(userMarketParams)
  const leverage = useUserCurrentLeverage(userMarketParams)
  const { data: userLoss, isLoading: isUserLossLoading } = useUserLoss(userMarketParams)

  // Market queries (fire in parallel)
  const { data: oraclePriceBand } = useMarketOraclePriceBand(marketParams)
  const { data: oraclePrice } = useMarketOraclePrice(marketParams)
  const { data: liquidationBand } = useMarketLiquidationBand(marketParams)
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates(marketParams)

  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.controller?.toLocaleLowerCase() as Address,
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: market?.collateral,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId,
    contractAddress: market?.controller as Address,
    agg: 'day',
    limit: 30, // fetch last 30 days for 30 day average calcs
  })

  const v2LeverageEnabled = useMemo(() => !!market && hasV2Leverage(market), [market])

  // Derived values
  const { collateral, stablecoin, debt } = userState ?? {}
  const isUserDataLoading = isUserStateLoading || isHealthFullLoading || isHealthNotFullLoading
  // Query validation only checks param presence (chain/market/user). We still need `!market`
  // because this hook runs before market metadata is available, and the UI reads market fields.
  const isPositionDetailsLoading = !market || !isHydrated

  const healthValue = useMemo(() => {
    if (!healthFull || !healthNotFull) return null
    return Number(+healthNotFull < 0 ? healthNotFull : healthFull)
  }, [healthFull, healthNotFull])

  const status = useMemo(() => {
    if (!healthNotFull || !userBands) return null
    const isClose = getIsUserCloseToLiquidation(userBands[0], liquidationBand ?? null, oraclePriceBand)
    return getLiquidationStatus(healthNotFull, isClose, stablecoin ?? '0')
  }, [healthNotFull, userBands, liquidationBand, oraclePriceBand, stablecoin])

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

  // Loading checks include hydration + query loading states for consistent UI behavior.
  return {
    marketType: LlamaMarketType.Mint,
    liquidationAlert: {
      softLiquidation: status?.colorKey === 'soft_liquidation',
      hardLiquidation: status?.colorKey === 'hard_liquidation',
    },
    health: {
      value: healthValue,
      loading: isUserDataLoading || isPositionDetailsLoading,
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
      loading: borrowApr == null || isSnapshotsLoading || isMarketRatesLoading || isPositionDetailsLoading,
    },
    liquidationRange: {
      value: userPrices ? userPrices.map(Number) : null,
      rangeToLiquidation:
        oraclePrice && userPrices
          ? calculateRangeToLiquidation(Number(userPrices?.[1]), Number(oraclePrice))
          : null,
      loading: isUserPricesLoading || isPositionDetailsLoading,
    },
    bandRange: {
      value: userBands ?? null,
      loading: isUserBandsLoading || isPositionDetailsLoading,
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: collateral ? Number(collateral) : null,
        usdRate: collateralUsdRate ? Number(collateralUsdRate) : null,
        symbol: market?.collateralSymbol,
      },
      borrow: {
        value: stablecoin ? Number(stablecoin) : null,
        usdRate: borrowedUsdRate ? Number(borrowedUsdRate) : null,
        symbol: 'crvUSD',
      },
      loading: isUserStateLoading || collateralUsdRateLoading || borrowedUsdRateLoading || isPositionDetailsLoading,
    },
    ltv: {
      value:
        collateralTotalValue && debt
          ? calculateLtv(Number(debt), Number(collateral), Number(stablecoin), borrowedUsdRate, collateralUsdRate)
          : null,
      loading: isUserStateLoading || isPositionDetailsLoading,
    },
    ...(v2LeverageEnabled && {
      leverage: {
        value: leverage.data ? Number(leverage.data) : null,
        loading: leverage.isLoading || isPositionDetailsLoading,
      },
    }),
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: isUserStateLoading || isPositionDetailsLoading,
    },
    collateralLoss: {
      depositedCollateral: decimal(userLoss?.deposited_collateral),
      currentCollateralEstimation: decimal(userLoss?.current_collateral_estimation),
      percentage: decimal(userLoss?.loss_pct),
      amount: decimal(userLoss?.loss),
      loading: isUserLossLoading || isPositionDetailsLoading,
    },
  }
}
