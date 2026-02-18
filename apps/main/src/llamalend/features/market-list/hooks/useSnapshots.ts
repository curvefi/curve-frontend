import lodash from 'lodash'
import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  LAST_WEEK,
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
} from '@/llamalend/rates.utils'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketRateType, LlamaMarketType } from '@ui-kit/types/market'

const { meanBy, sumBy } = lodash

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
  [MarketRateType.Supply]: 'lendApr',
} as const

const DAYS_BACK = LAST_WEEK

export function useSnapshots<T extends CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: MarketRateType,
  enabled: boolean = true,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === MarketRateType.Borrow && enabled
  const contractAddress = controllerAddress
  const params = { blockchainId: chain, contractAddress, limit: DAYS_BACK } // fetch last 7 days for 7 day average calcs
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
      type === MarketRateType.Borrow
        ? getBorrowRateMetrics({
            borrowRate: rates.borrowApr,
            snapshots: snapshots ?? undefined,
            getBorrowRate: getSnapshotBorrowRate,
            getRebasingYield: getSnapshotCollateralRebasingYieldRate,
            daysBack: DAYS_BACK,
          } as Parameters<typeof getBorrowRateMetrics>[0])
        : null,
    [rates.borrowApr, snapshots, type],
  )

  const averageRate = useMemo(
    () =>
      type === MarketRateType.Borrow
        ? (borrowRateMetrics?.averageRate ?? null)
        : isLend
          ? snapshots && meanBy(snapshots as LendingSnapshot[], (row) => row.lendApr) * 100
          : null,
    [borrowRateMetrics, isLend, snapshots, type],
  )

  const averageTotalBorrowRate = borrowRateMetrics?.averageTotalRate ?? null

  const minBoostedAprAverage = useMemo(
    () =>
      snapshots &&
      isLend &&
      type === MarketRateType.Supply &&
      meanBy(
        snapshots as LendingSnapshot[],
        (row) =>
          row.lendApr * 100 +
          row.lendAprCrv0Boost +
          (row.borrowedToken?.rebasingYield ?? 0) +
          (sumBy(row.extraRewardApr, 'rate') ?? 0),
      ),
    [snapshots, isLend, type],
  )

  const maxBoostedAprAverage = useMemo(
    () =>
      snapshots &&
      isLend &&
      type === MarketRateType.Supply &&
      meanBy(
        snapshots as LendingSnapshot[],
        (row) =>
          row.lendApr * 100 +
          row.lendAprCrvMaxBoost +
          (row.borrowedToken?.rebasingYield ?? 0) +
          (sumBy(row.extraRewardApr, 'rate') ?? 0),
      ),
    [snapshots, isLend, type],
  )

  return {
    snapshots,
    isLoading,
    snapshotKey,
    rate: rates[RateKeys[type]],
    averageRate,
    averageTotalBorrowRate,
    minBoostedAprAverage,
    maxBoostedAprAverage,
    error,
    period: `${DAYS_BACK}D`,
  } as UseSnapshotsResult<T>
}
