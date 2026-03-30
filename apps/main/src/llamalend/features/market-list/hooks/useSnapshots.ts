import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  LAST_WEEK,
  getBorrowRateMetrics,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyApyAverageMetrics,
} from '@/llamalend/rates.utils'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketRateType, LlamaMarketType } from '@ui-kit/types/market'

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
  period: string
}

const RateKeys = {
  [MarketRateType.Borrow]: 'borrowApr',
  [MarketRateType.Supply]: 'lendApy',
} as const satisfies Record<MarketRateType, 'borrowApr' | 'lendApy'>

const DAYS_BACK = LAST_WEEK

export function useSnapshots<T extends CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: MarketRateType,
  enabled: boolean,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === MarketRateType.Borrow && enabled
  const params = {
    blockchainId: chain,
    contractAddress: controllerAddress,
    aggregate: 'day' as const,
    limit: DAYS_BACK, // fetch last 7 days for 7 day average calcs
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
              daysBack: DAYS_BACK,
            } as Parameters<typeof getBorrowRateMetrics>[0]),
          [MarketRateType.Supply]: () => null,
        }) satisfies Record<MarketRateType, () => ReturnType<typeof getBorrowRateMetrics> | null>
      )[type](),
    [rates.borrowApr, snapshots, type],
  )

  const supplyRateMetrics = useMemo(
    () =>
      isLend && type === MarketRateType.Supply
        ? getSupplyApyAverageMetrics({
            snapshots: poolSnapshots,
            daysBack: DAYS_BACK,
          })
        : null,
    [isLend, type, poolSnapshots],
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
    period: `${DAYS_BACK}D`,
  } as UseSnapshotsResult<T>
}
