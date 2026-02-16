import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { networks } from '@/lend/networks'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import {
  calculateRangeToLiquidation,
  type BorrowPositionDetailsProps,
} from '@/llamalend/features/market-position-details'
import { calculateLtv, getIsUserCloseToLiquidation, getLiquidationStatus } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
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
import type { Address, Chain } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'
import { decimal } from '@ui-kit/utils/decimal'

type UseBorrowPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

const averageMultiplier = 30
const averageMultiplierString = `${averageMultiplier}D`

export const useBorrowPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseBorrowPositionDetailsProps): BorrowPositionDetailsProps => {
  const { isHydrated } = useCurve()
  const { controller } = market?.addresses ?? {}
  const { address: userAddress } = useConnection()
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId,
    userAddress,
  })
  const userMarketParams = { chainId, marketId, userAddress }
  const marketParams = { chainId, marketId }
  const hasLoan = loanExists === true
  const shouldFetchUserDetails = hasLoan

  const { data: userState, isLoading: isUserStateLoading } = useUserState(userMarketParams, shouldFetchUserDetails)
  const { data: healthFull, isLoading: isHealthFullLoading } = useUserHealth(
    { ...userMarketParams, isFull: true },
    shouldFetchUserDetails,
  )
  const { data: healthNotFull, isLoading: isHealthNotFullLoading } = useUserHealth(
    { ...userMarketParams, isFull: false },
    shouldFetchUserDetails,
  )
  const { data: userBands, isLoading: isUserBandsLoading } = useUserBands(userMarketParams, shouldFetchUserDetails)
  const { data: userPrices, isLoading: isUserPricesLoading } = useUserPrices(userMarketParams, { loanExists: hasLoan })
  const leverage = useUserCurrentLeverage(userMarketParams, shouldFetchUserDetails)
  const { data: userLoss, isLoading: isUserLossLoading } = useUserLoss(userMarketParams, shouldFetchUserDetails)

  const { data: oraclePrice } = useMarketOraclePrice(marketParams)
  const { data: oraclePriceBand } = useMarketOraclePriceBand(marketParams)
  const { data: liquidationBand } = useMarketLiquidationBand(marketParams)
  const blockchainId = networks[chainId].id as Chain
  const { data: campaigns } = useCampaignsByAddress({ blockchainId, address: controller as Address })
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates(marketParams)
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: market?.addresses?.collateral_token,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: market?.addresses?.borrowed_token,
  })
  const { data: lendSnapshots, isLoading: isLendSnapshotsLoading } = useLendingSnapshots({
    blockchainId,
    contractAddress: market?.addresses?.controller as Address,
    agg: 'day',
    limit: 30, // fetch last 30 days for 30 day average calcs
  })

  const { rate: averageRate, rebasingYield: averageRebasingYield } = useMemo(
    () =>
      calculateAverageRates(lendSnapshots, averageMultiplier, {
        rate: ({ borrowApy }) => borrowApy * 100,
        rebasingYield: ({ collateralToken }) => collateralToken.rebasingYield,
      }) ?? { rate: null, rebasingYield: null },
    [lendSnapshots],
  )

  const { collateral, stablecoin: borrowed, debt } = hasLoan ? (userState ?? {}) : {}
  // Query validation only checks param presence (chain/market/user). We still need `!market`
  // because this hook runs before market metadata is available, and the UI reads market fields.
  const isMarketMetadataLoading = !market || !isHydrated

  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)
  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral || !borrowed) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(borrowed)
  }, [collateral, borrowed, collateralUsdRate])

  const rebasingYield = lendSnapshots?.[lendSnapshots.length - 1]?.collateralToken?.rebasingYield // take most recent rebasing yield
  const totalBorrowRate = borrowApr != null ? borrowApr - (rebasingYield ?? 0) : null

  const healthValue = useMemo(() => {
    if (!hasLoan) return null
    if (!healthFull || !healthNotFull) return null
    return Number(+healthNotFull < 0 ? healthNotFull : healthFull)
  }, [hasLoan, healthFull, healthNotFull])

  const status = useMemo(() => {
    if (!hasLoan) return null
    if (!healthNotFull || !userBands) return null
    const isClose = getIsUserCloseToLiquidation(userBands[0], liquidationBand ?? null, oraclePriceBand)
    return getLiquidationStatus(healthNotFull, isClose, borrowed ?? '0')
  }, [hasLoan, healthNotFull, userBands, liquidationBand, oraclePriceBand, borrowed])

  return {
    marketType: LlamaMarketType.Lend,
    liquidationAlert: {
      softLiquidation: status?.colorKey === 'soft_liquidation',
      hardLiquidation: status?.colorKey === 'hard_liquidation',
    },
    health: {
      value: healthValue,
      loading:
        isMarketMetadataLoading || isLoanExistsLoading || (hasLoan && (isHealthFullLoading || isHealthNotFullLoading)),
    },
    borrowRate: {
      rate: borrowApr,
      averageRate: averageRate,
      averageRateLabel: averageMultiplierString,
      rebasingYield: rebasingYield ?? null,
      averageRebasingYield: averageRebasingYield ?? null,
      totalBorrowRate,
      totalAverageBorrowRate: averageRate ? averageRate - (averageRebasingYield ?? 0) : null,
      extraRewards: campaigns,
      loading: isMarketMetadataLoading || isLendSnapshotsLoading || isMarketRatesLoading,
    },
    liquidationRange: {
      value: hasLoan && userPrices ? userPrices.map(Number) : null,
      rangeToLiquidation:
        hasLoan && oraclePrice && userPrices
          ? calculateRangeToLiquidation(Number(userPrices[1]), Number(oraclePrice))
          : null,
      loading: isMarketMetadataLoading || isLoanExistsLoading || (hasLoan && isUserPricesLoading),
    },
    bandRange: {
      value: hasLoan ? userBands : null,
      loading: isMarketMetadataLoading || isLoanExistsLoading || (hasLoan && isUserBandsLoading),
    },
    collateralValue: {
      totalValue: collateralTotalValue,
      collateral: {
        value: collateral ? Number(collateral) : null,
        usdRate: collateralUsdRate ?? null,
        symbol: market?.collateral_token?.symbol,
      },
      borrow: {
        value: borrowed ? Number(borrowed) : null,
        usdRate: borrowedUsdRate ?? null,
        symbol: market?.borrowed_token?.symbol,
      },
      loading:
        isMarketMetadataLoading ||
        isLoanExistsLoading ||
        (hasLoan && (isUserStateLoading || collateralUsdRateLoading || borrowedUsdRateLoading)),
    },
    ltv: {
      value:
        collateralTotalValue && debt
          ? calculateLtv(Number(debt), Number(collateral), Number(borrowed), borrowedUsdRate, collateralUsdRate)
          : null,
      loading:
        isMarketMetadataLoading ||
        isLoanExistsLoading ||
        (hasLoan && (isUserStateLoading || collateralUsdRateLoading || borrowedUsdRateLoading)),
    },
    leverage: {
      value: hasLoan && leverage.data ? Number(leverage.data) : null,
      loading: isMarketMetadataLoading || isLoanExistsLoading || (hasLoan && leverage.isLoading),
    },
    totalDebt: {
      value: hasLoan && debt ? Number(debt) : null,
      loading: isMarketMetadataLoading || isLoanExistsLoading || (hasLoan && isUserStateLoading),
    },
    collateralLoss: {
      depositedCollateral: hasLoan ? decimal(userLoss?.deposited_collateral) : undefined,
      currentCollateralEstimation: hasLoan ? decimal(userLoss?.current_collateral_estimation) : undefined,
      percentage: hasLoan ? decimal(userLoss?.loss_pct) : undefined,
      amount: hasLoan ? decimal(userLoss?.loss) : undefined,
      loading: isMarketMetadataLoading || isLoanExistsLoading || (hasLoan && isUserLossLoading),
    },
  }
}
