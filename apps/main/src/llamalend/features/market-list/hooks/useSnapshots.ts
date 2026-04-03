import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  getBorrowRateMetrics,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyApyAverageMetrics,
} from '@/llamalend/rates.utils'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketRateType, LlamaMarketType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES, type AverageCategory } from '@ui-kit/utils'

type UseSnapshotsResult<T> = {
  snapshots: T[] | null
  isLoading: boolean
  snapshotKey: keyof T
  rate: number | null
  averageRate: number | null
  averageTotalBorrowRate: number | null
  minBoostedAprAverage: number | null
  maxBoostedAprAverage: number | null
  error: unknown
}

const RateKeys = {
  [MarketRateType.Borrow]: 'borrowApr',
  [MarketRateType.Supply]: 'lendApy',
} as const satisfies Record<MarketRateType, 'borrowApr' | 'lendApy'>

export function useSnapshots<T extends CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  { type, category }: { type: MarketRateType; category: AverageCategory },
  enabled: boolean,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === MarketRateType.Borrow && enabled
  const { value: rateWindow, aggregate: rateAggregate } = AVERAGE_CATEGORIES[category]
  const params = {
    blockchainId: chain,
    contractAddress: controllerAddress,
    aggregate: rateAggregate,
    limit: rateWindow,
  }
  const { data: poolSnapshots, isLoading: lendIsLoading, error: poolError } = useLendingSnapshots(params, showLendGraph)
  const { data: mintSnapshots, isLoading: mintIsLoading, error: mintError } = useCrvUsdSnapshots(params, showMintGraph)

  const { snapshots, isLoading, snapshotKey, error } = isLend
    ? {
        snapshots: (showLendGraph && poolSnapshots) || null,
        isLoading: !enabled || lendIsLoading,
        snapshotKey: RateKeys[type],
        error: poolError,
      }
    : {
        snapshots: (showMintGraph && mintSnapshots) || null,
        isLoading: !enabled || mintIsLoading,
        snapshotKey: RateKeys[MarketRateType.Borrow],
        error: mintError,
      }

  const borrowRateMetrics = useMemo(
    () =>
      (
        ({
          [MarketRateType.Borrow]: () =>
            getBorrowRateMetrics({
              borrowRate: rates.borrowApr,
              snapshots: snapshots ?? undefined,
              getBorrowRate: getSnapshotBorrowApr,
              getRebasingYield: getSnapshotCollateralRebasingYieldApr,
              daysBack: rateWindow,
            } as Parameters<typeof getBorrowRateMetrics>[0]),
          [MarketRateType.Supply]: () => null,
        }) satisfies Record<MarketRateType, () => ReturnType<typeof getBorrowRateMetrics> | null>
      )[type](),
    [rateWindow, rates.borrowApr, snapshots, type],
  )

  const supplyRateMetrics = useMemo(
    () =>
      isLend && type === MarketRateType.Supply
        ? getSupplyApyAverageMetrics({
            snapshots: poolSnapshots,
            daysBack: rateWindow,
          })
        : null,
    [rateWindow, isLend, poolSnapshots, type],
  )

  return {
    snapshots,
    isLoading,
    snapshotKey,
    rate: rates[RateKeys[type]],
    averageRate:
      type === MarketRateType.Supply
        ? (supplyRateMetrics?.averageLendApy ?? null)
        : (borrowRateMetrics?.averageRate ?? null),
    averageTotalBorrowRate: borrowRateMetrics?.averageTotalRate ?? null,
    minBoostedAprAverage: supplyRateMetrics?.totalAverageMinBoost ?? null,
    maxBoostedAprAverage: supplyRateMetrics?.totalAverageMaxBoost ?? null,
    error,
  } as UseSnapshotsResult<T>
}
