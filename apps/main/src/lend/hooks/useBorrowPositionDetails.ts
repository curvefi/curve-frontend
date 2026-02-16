import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useUserLoanDetails } from '@/lend/entities/user-loan-details'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { calculateRangeToLiquidation } from '@/llamalend/features/market-position-details/utils'
import { calculateLtv } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import {
  getBorrowRateMetrics,
  getLendingSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
  LAST_MONTH,
} from '@/llamalend/rates.utils'
import type { Address, Chain } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { decimal } from '@ui-kit/utils/decimal'

type UseBorrowPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
}

export const useBorrowPositionDetails = ({
  chainId,
  market,
  marketId,
}: UseBorrowPositionDetailsProps): BorrowPositionDetailsProps => {
  const { controller } = market?.addresses ?? {}
  const { address: userAddress } = useConnection()
  const { data: loanExists } = useLoanExists({
    chainId,
    marketId,
    userAddress,
  })
  const { data: userLoanDetails, isLoading: isUserLoanDetailsLoading } = useUserLoanDetails(
    {
      chainId,
      marketId,
      userAddress,
    },
    !!loanExists,
  )
  const {
    bands,
    health,
    leverage,
    loss,
    prices: liquidationPrices,
    status,
    state: { collateral, borrowed, debt } = {},
  } = userLoanDetails ?? {}
  const prices = useStore((state) => state.markets.pricesMapper[chainId]?.[marketId])
  const blockchainId = networks[chainId].id as Chain
  const { data: campaigns } = useCampaignsByAddress({ blockchainId, address: controller as Address })
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({
    chainId: chainId,
    marketId: marketId,
  })
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
    limit: LAST_MONTH,
  })

  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)

  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral || !borrowed) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(borrowed)
  }, [collateral, borrowed, collateralUsdRate])

  const {
    averageRate: averageBorrowApr,
    averageRebasingYield: averageRebasingYieldApr,
    totalRate: totalBorrowRate,
    averageTotalRate: totalAverageBorrowRate,
    rebasingYield: rebasingYieldApr,
  } = getBorrowRateMetrics({
    borrowRate: borrowApr,
    snapshots: lendSnapshots,
    getBorrowRate: getLendingSnapshotBorrowRate,
    getRebasingYield: getSnapshotCollateralRebasingYieldRate,
  })

  return {
    marketType: LlamaMarketType.Lend,
    liquidationAlert: {
      softLiquidation: status?.colorKey === 'soft_liquidation',
      hardLiquidation: status?.colorKey === 'hard_liquidation',
    },
    health: {
      value: health ? Number(health) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    borrowRate: {
      rate: borrowApr,
      averageRate: averageBorrowApr,
      averageRateLabel: `${LAST_MONTH}D`,
      rebasingYield: rebasingYieldApr ?? null,
      averageRebasingYield: averageRebasingYieldApr ?? null,
      totalBorrowRate,
      totalAverageBorrowRate,
      extraRewards: campaigns,
      loading: !market || isLendSnapshotsLoading || isMarketRatesLoading || !market?.addresses.controller,
    },
    liquidationRange: {
      value: liquidationPrices ? liquidationPrices.map(Number) : null,
      rangeToLiquidation:
        prices?.prices?.oraclePrice && liquidationPrices
          ? calculateRangeToLiquidation(Number(liquidationPrices?.[1]), Number(prices.prices.oraclePrice))
          : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    bandRange: {
      value: bands,
      loading: !market || isUserLoanDetailsLoading,
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
      loading: !market || isUserLoanDetailsLoading || collateralUsdRateLoading || borrowedUsdRateLoading,
    },
    ltv: {
      value:
        collateralTotalValue && debt
          ? calculateLtv(Number(debt), Number(collateral), Number(borrowed), borrowedUsdRate, collateralUsdRate)
          : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    leverage: {
      value: leverage ? Number(leverage) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    totalDebt: {
      value: debt ? Number(debt) : null,
      loading: !market || isUserLoanDetailsLoading,
    },
    collateralLoss: {
      depositedCollateral: decimal(loss?.deposited_collateral),
      currentCollateralEstimation: decimal(loss?.current_collateral_estimation),
      percentage: decimal(loss?.loss_pct),
      amount: decimal(loss?.loss),
      loading: !market || isUserLoanDetailsLoading,
    },
  }
}
