import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  calculateRangeToLiquidation,
  type BorrowPositionDetailsProps,
} from '@/llamalend/features/market-position-details'
import {
  getDisplayHealth,
  getIsUserCloseToSoftLiquidation,
  getLiquidationStatus,
  hasV2Leverage,
  isBelowRange,
} from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketLiquidationBand, useMarketOraclePriceBand, useMarketOraclePrice } from '@/llamalend/queries/market'
import { useLoanExists } from '@/llamalend/queries/user'
import {
  useUserBands,
  useUserCurrentLeverage,
  useUserHealth,
  useUserPrices,
  useUserState,
} from '@/llamalend/queries/user'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD } from '@ui-kit/utils/address'

const fromLend = (market?: LendMarketTemplate | null) => ({
  collateralTokenAddress: market?.addresses.collateral_token,
  collateralSymbol: market?.collateral_token?.symbol,
  borrowTokenAddress: market?.addresses.borrowed_token,
  borrowSymbol: market?.borrowed_token?.symbol,
  leverageEnabled: true,
})

const fromMint = (market?: MintMarketTemplate | null) => ({
  collateralTokenAddress: market?.collateral,
  collateralSymbol: market?.collateralSymbol,
  borrowTokenAddress: CRVUSD.address,
  borrowSymbol: CRVUSD.symbol,
  leverageEnabled: market ? hasV2Leverage(market) : false,
})

const resolveMarket = (marketType: LlamaMarketType, market: LlamaMarketTemplate | null | undefined) =>
  marketType === LlamaMarketType.Lend
    ? fromLend(market as LendMarketTemplate | undefined)
    : fromMint(market as MintMarketTemplate | undefined)

type UseBorrowPositionDetailsParams = {
  marketType: LlamaMarketType
  chainId: number
  marketId: string
  market: LlamaMarketTemplate | null | undefined
}

export const useBorrowPositionDetails = ({
  marketType,
  chainId,
  marketId,
  market,
}: UseBorrowPositionDetailsParams): BorrowPositionDetailsProps => {
  const { isHydrated } = useCurve()
  const { address: userAddress } = useConnection()
  const { collateralTokenAddress, collateralSymbol, borrowTokenAddress, borrowSymbol, leverageEnabled } = useMemo(
    () => resolveMarket(marketType, market),
    [marketType, market],
  )

  const userMarketParams = { chainId, marketId, userAddress }
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(userMarketParams)
  /** `hasLoan` is used both to gate user queries and to guard rendered values.
  Disabled queries can still expose cached data, so render guards prevent stale values after loan closure. */
  const hasLoan = !!loanExists

  const { data: userStateValue, isLoading: isUserStateLoading } = useUserState(userMarketParams, hasLoan)
  const { data: healthFullValue, isLoading: isHealthFullLoading } = useUserHealth(
    { ...userMarketParams, isFull: true },
    hasLoan,
  )
  const { data: healthNotFullValue, isLoading: isHealthNotFullLoading } = useUserHealth(
    { ...userMarketParams, isFull: false },
    hasLoan,
  )
  const { data: userBandsValue, isLoading: isUserBandsLoading } = useUserBands(userMarketParams, hasLoan)
  const { data: userPricesValue, isLoading: isUserPricesLoading } = useUserPrices(userMarketParams)
  const { data: leverage, isLoading: isLeverageLoading } = useUserCurrentLeverage(userMarketParams, hasLoan)

  const marketParams = { chainId: chainId as IChainId, marketId }
  const { data: oraclePrice } = useMarketOraclePrice(marketParams)
  const { data: oraclePriceBand } = useMarketOraclePriceBand(marketParams)
  const { data: liquidationBand } = useMarketLiquidationBand(marketParams)

  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: collateralTokenAddress,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowTokenAddress,
  })

  const { collateral, stablecoin: borrowed, debt } = hasLoan ? (userStateValue ?? {}) : {}
  const isPositionDetailsLoading = !market || !isHydrated
  const isUserDataLoading =
    isLoanExistsLoading || (hasLoan && (isUserStateLoading || isHealthFullLoading || isHealthNotFullLoading))

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral || !borrowed) return null
    return +collateral * +collateralUsdRate + +borrowed
  }, [collateral, borrowed, collateralUsdRate])

  const healthValue = useMemo(
    () => (hasLoan ? getDisplayHealth(healthFullValue, healthNotFullValue) : null),
    [hasLoan, healthFullValue, healthNotFullValue],
  )

  const positionStatus = useMemo(() => {
    if (!hasLoan || !healthNotFullValue || !userBandsValue) return undefined
    const isCloseToSoftLiquidation = getIsUserCloseToSoftLiquidation(
      userBandsValue[0],
      liquidationBand ?? null,
      oraclePriceBand,
    )
    const [, lowerBoundary] = userBandsValue
    return getLiquidationStatus(
      healthNotFullValue,
      isCloseToSoftLiquidation,
      isBelowRange(oraclePriceBand, lowerBoundary),
      collateral,
      borrowed,
    )
  }, [hasLoan, healthNotFullValue, userBandsValue, liquidationBand, oraclePriceBand, collateral, borrowed])

  return {
    liquidationAlert: {
      softLiquidation: positionStatus === 'softLiquidation',
      hardLiquidation: positionStatus === 'hardLiquidation',
      status: positionStatus,
    },
    health: {
      value: healthValue,
      loading: isUserDataLoading || isPositionDetailsLoading,
    },
    liquidationRange: {
      value: hasLoan && userPricesValue ? userPricesValue.map(Number) : null,
      rangeToLiquidation:
        hasLoan && oraclePrice && userPricesValue
          ? calculateRangeToLiquidation(+userPricesValue[1], +oraclePrice)
          : null,
      loading: isPositionDetailsLoading || isLoanExistsLoading || (hasLoan && isUserPricesLoading),
    },
    bandRange: {
      value: hasLoan ? userBandsValue : null,
      loading: isPositionDetailsLoading || isLoanExistsLoading || (hasLoan && isUserBandsLoading),
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: collateral ? +collateral : null,
        usdRate: collateralUsdRate ?? null,
        symbol: collateralSymbol,
      },
      borrow: {
        value: borrowed ? +borrowed : null,
        usdRate: borrowedUsdRate ?? null,
        symbol: borrowSymbol,
      },
      loading:
        isPositionDetailsLoading ||
        isLoanExistsLoading ||
        collateralUsdRateLoading ||
        borrowedUsdRateLoading ||
        (hasLoan && isUserStateLoading),
    },
    ...(leverageEnabled && {
      leverage: {
        value: hasLoan && leverage ? +leverage : null,
        loading: isPositionDetailsLoading || isLoanExistsLoading || (hasLoan && isLeverageLoading),
      },
    }),
    totalDebt: {
      value: debt ? +debt : null,
      loading: isPositionDetailsLoading || isLoanExistsLoading || (hasLoan && isUserStateLoading),
    },
  }
}
