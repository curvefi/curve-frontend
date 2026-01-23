import lodash from 'lodash'
import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
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
  period: '7D' // this will be extended in the future
}

const SnapshotKeys = {
  [MarketRateType.Borrow]: 'borrowApr',
  [MarketRateType.Supply]: 'lendApr',
} as const

const RateKeys = {
  [MarketRateType.Borrow]: 'borrowApr',
  [MarketRateType.Supply]: 'lendApr',
} as const

export function useSnapshots<T extends CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: MarketRateType,
  enabled: boolean = true,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === MarketRateType.Borrow && enabled
  const contractAddress = controllerAddress
  const params = { blockchainId: chain, contractAddress, limit: 7 } // fetch last 7 days for 7 day average calcs
  const { data: poolSnapshots, isLoading: lendIsLoading, error: poolError } = useLendingSnapshots(params, showLendGraph)
  const { data: mintSnapshots, isLoading: mintIsLoading, error: mintError } = useCrvUsdSnapshots(params, showMintGraph)

  const { snapshots, isLoading, snapshotKey, error } = isLend
    ? {
        snapshots: (showLendGraph && poolSnapshots) || null,
        isLoading: !enabled || lendIsLoading,
        snapshotKey: SnapshotKeys[type],
        error: poolError,
      }
    : {
        snapshots: (showMintGraph && mintSnapshots) || null,
        isLoading: !enabled || mintIsLoading,
        snapshotKey: 'rate' as const,
        error: mintError,
      }

  const averageRate = useMemo(
    () => snapshots && meanBy(snapshots as T[], (row) => row[snapshotKey as keyof T]) * 100,
    [snapshots, snapshotKey],
  )

  const averageTotalBorrowRate = useMemo(
    () => snapshots && meanBy(snapshots as LendingSnapshot[], (row) => row.borrowTotalApr * 100),
    [snapshots],
  )

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
    period: '7D',
  } as UseSnapshotsResult<T>
}
