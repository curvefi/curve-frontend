import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useUserLoanDetails } from '@/lend/entities/user-loan-details'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import {
  calculateRangeToLiquidation,
  type BorrowPositionDetailsProps,
} from '@/llamalend/features/market-position-details'
import { calculateLtv } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useMarketRates } from '@/llamalend/queries/market-rates'
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

  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)
  const collateralTotalValue = useMemo(() => {
    if (!collateralUsdRate || !collateral || !borrowed) return null
    return Number(collateral) * Number(collateralUsdRate) + Number(borrowed)
  }, [collateral, borrowed, collateralUsdRate])

  const rebasingYield = lendSnapshots?.[lendSnapshots.length - 1]?.collateralToken?.rebasingYield // take most recent rebasing yield
  const totalBorrowRate = borrowApr != null ? borrowApr - (rebasingYield ?? 0) : null
  const healthValue = health ? Number(health) : null
  const liquidationRangeValue = liquidationPrices ? liquidationPrices.map(Number) : null
  const ltvValue =
    collateralTotalValue && debt
      ? calculateLtv(Number(debt), Number(collateral), Number(borrowed), borrowedUsdRate, collateralUsdRate)
      : null
  const leverageValue = leverage ? Number(leverage) : null
  const totalDebtValue = debt ? Number(debt) : null

  return {
    marketType: LlamaMarketType.Lend,
    liquidationAlert: {
      softLiquidation: status?.colorKey === 'soft_liquidation',
      hardLiquidation: status?.colorKey === 'hard_liquidation',
    },
    health: {
      value: healthValue,
      loading: isUserLoanDetailsLoading || !isHydrated,
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
      loading: isLendSnapshotsLoading || isMarketRatesLoading || !isHydrated,
    },
    liquidationRange: {
      value: liquidationRangeValue,
      rangeToLiquidation:
        prices?.prices?.oraclePrice && liquidationPrices
          ? calculateRangeToLiquidation(Number(liquidationPrices?.[1]), Number(prices.prices.oraclePrice))
          : null,
      loading: isUserLoanDetailsLoading || !isHydrated,
    },
    bandRange: {
      value: bands,
      loading: isUserLoanDetailsLoading || !isHydrated,
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
      loading: isUserLoanDetailsLoading || collateralUsdRateLoading || borrowedUsdRateLoading || !isHydrated,
    },
    ltv: {
      value: ltvValue,
      loading: isUserLoanDetailsLoading || !isHydrated,
    },
    leverage: {
      value: leverageValue,
      loading: isUserLoanDetailsLoading || !isHydrated,
    },
    totalDebt: {
      value: totalDebtValue,
      loading: isUserLoanDetailsLoading || !isHydrated,
    },
    collateralLoss: {
      depositedCollateral: decimal(loss?.deposited_collateral),
      currentCollateralEstimation: decimal(loss?.current_collateral_estimation),
      percentage: decimal(loss?.loss_pct),
      amount: decimal(loss?.loss),
      loading: isUserLoanDetailsLoading || !isHydrated,
    },
  }
}
