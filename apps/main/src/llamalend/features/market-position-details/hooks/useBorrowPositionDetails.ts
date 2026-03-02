import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  calculateRangeToLiquidation,
  type BorrowPositionDetailsProps,
} from '@/llamalend/features/market-position-details'
import { calculateLtv, getIsUserCloseToLiquidation, getLiquidationStatus, hasV2Leverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  useMarketLiquidationBand,
  useMarketOraclePriceBand,
  useMarketOraclePrice,
  useMarketRates,
} from '@/llamalend/queries/market'
import { useLoanExists } from '@/llamalend/queries/user'
import {
  useUserBands,
  useUserCurrentLeverage,
  useUserHealth,
  useUserPrices,
  useUserState,
} from '@/llamalend/queries/user'
import {
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
  LAST_MONTH,
} from '@/llamalend/rates.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { type Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD } from '@ui-kit/utils/address'

const fromLend = (market?: LendMarketTemplate | null) => ({
  isLendMarket: true,
  controllerAddress: market?.addresses.controller as Address | undefined,
  collateralTokenAddress: market?.addresses.collateral_token,
  collateralSymbol: market?.collateral_token?.symbol,
  borrowTokenAddress: market?.addresses.borrowed_token,
  borrowSymbol: market?.borrowed_token?.symbol,
  leverageEnabled: true,
})

const fromMint = (market?: MintMarketTemplate | null) => ({
  isLendMarket: false,
  controllerAddress: market?.controller as Address | undefined,
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

type UsePositionDetailsParams = {
  marketType: LlamaMarketType
  chainId: number
  marketId: string
  blockchainId: Chain | undefined
  market: LlamaMarketTemplate | null | undefined
}

export const useBorrowPositionDetails = ({
  marketType,
  chainId,
  marketId,
  blockchainId,
  market,
}: UsePositionDetailsParams): BorrowPositionDetailsProps => {
  const { isHydrated } = useCurve()
  const { address: userAddress } = useConnection()
  const {
    isLendMarket,
    controllerAddress,
    collateralTokenAddress,
    collateralSymbol,
    borrowTokenAddress,
    borrowSymbol,
    leverageEnabled,
  } = useMemo(() => resolveMarket(marketType, market), [marketType, market])

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
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates(marketParams)

  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: controllerAddress?.toLowerCase() as Address | undefined,
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: collateralTokenAddress,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowTokenAddress,
  })

  const snapshotParams = {
    blockchainId,
    contractAddress: controllerAddress,
    agg: 'day' as const,
    limit: LAST_MONTH,
  }
  const { data: lendSnapshots, isLoading: isLendSnapshotsLoading } = useLendingSnapshots(snapshotParams, isLendMarket)
  const { data: mintSnapshots, isLoading: isMintSnapshotsLoading } = useCrvUsdSnapshots(snapshotParams, !isLendMarket)
  const activeSnapshots = isLendMarket ? lendSnapshots : mintSnapshots
  const isSnapshotsLoading = isLendMarket ? isLendSnapshotsLoading : isMintSnapshotsLoading

  const { collateral, stablecoin: borrowed, debt } = hasLoan ? (userStateValue ?? {}) : {}
  const isPositionDetailsLoading = !market || !isHydrated
  const isUserDataLoading =
    isLoanExistsLoading || (hasLoan && (isUserStateLoading || isHealthFullLoading || isHealthNotFullLoading))

  const borrowApr = marketRates?.borrowApr == null ? null : +marketRates.borrowApr
  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral || !borrowed) return null
    return +collateral * +collateralUsdRate + +borrowed
  }, [collateral, borrowed, collateralUsdRate])

  const {
    averageRate: averageBorrowApr,
    averageRebasingYield: averageRebasingYieldApr,
    totalRate: totalBorrowRate,
    averageTotalRate: totalAverageBorrowRate,
    rebasingYield: rebasingYieldApr,
  } = useMemo(
    () =>
      getBorrowRateMetrics({
        borrowRate: borrowApr,
        snapshots: activeSnapshots,
        getBorrowRate: getSnapshotBorrowRate,
        getRebasingYield: getSnapshotCollateralRebasingYieldRate,
      }),
    [borrowApr, activeSnapshots],
  )

  const healthValue = useMemo(() => {
    if (!hasLoan || !healthFullValue || !healthNotFullValue) return null
    return +(+healthNotFullValue < 0 ? healthNotFullValue : healthFullValue)
  }, [hasLoan, healthFullValue, healthNotFullValue])

  const status = useMemo(() => {
    if (!hasLoan || !healthNotFullValue || !userBandsValue) return null
    const isClose = getIsUserCloseToLiquidation(userBandsValue[0], liquidationBand ?? null, oraclePriceBand)
    return getLiquidationStatus(healthNotFullValue, isClose, borrowed ?? '0')
  }, [hasLoan, healthNotFullValue, userBandsValue, liquidationBand, oraclePriceBand, borrowed])

  return {
    marketType,
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
      averageRate: averageBorrowApr,
      averageRateLabel: `${LAST_MONTH}D`,
      rebasingYield: rebasingYieldApr,
      averageRebasingYield: averageRebasingYieldApr,
      totalBorrowRate,
      totalAverageBorrowRate,
      extraRewards: campaigns ?? [],
      loading: isPositionDetailsLoading || isSnapshotsLoading || isMarketRatesLoading,
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
    ltv: {
      value:
        collateralTotalValue && debt
          ? calculateLtv(+debt, +(collateral ?? 0), +(borrowed ?? 0), borrowedUsdRate, collateralUsdRate)
          : null,
      loading: isPositionDetailsLoading || isLoanExistsLoading || (hasLoan && isUserStateLoading),
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
