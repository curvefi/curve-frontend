import { meanBy } from 'lodash'
import { useMemo } from 'react'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@/loan/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@/loan/entities/lending-snapshots'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'

export type RateType = 'borrow' | 'lend'

type UseSnapshotsResult<T> = {
  snapshots: T[] | null
  isLoading: boolean
  snapshotKey: keyof T
  rate: number | null
  averageRate: number | null
  maxBoostedAprAverage: number | null
  error: unknown
  period: '7D' // this will be extended in the future
}

export function useSnapshots<T extends CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: RateType,
  enabled: boolean = true,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === 'borrow' && enabled
  const contractAddress = controllerAddress
  const params = { blockchainId: chain, contractAddress }
  const { data: poolSnapshots, isLoading: lendIsLoading, error: poolError } = useLendingSnapshots(params, showLendGraph)
  const { data: mintSnapshots, isLoading: mintIsLoading, error: mintError } = useCrvUsdSnapshots(params, showMintGraph)

  const { snapshots, isLoading, snapshotKey, error } = isLend
    ? {
        snapshots: (showLendGraph && poolSnapshots) || null,
        isLoading: !enabled || lendIsLoading,
        snapshotKey: type === 'borrow' ? (`borrowApy` as const) : (`lendApr` as const),
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

  const maxBoostedAprAverage = useMemo(
    () =>
      snapshots &&
      isLend &&
      type === 'lend' &&
      meanBy(snapshots as LendingSnapshot[], (row) => row.lendApr + row.lendAprCrvMaxBoost) * 100,
    [snapshots, isLend, type],
  )

  return {
    snapshots,
    isLoading,
    snapshotKey,
    rate: type === 'borrow' ? rates.borrow : rates.lendApr,
    averageRate,
    maxBoostedAprAverage,
    error,
    period: '7D',
  } as UseSnapshotsResult<T>
}
