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
  error: unknown
  period: '7D' // this will be extended in the future
}

export function useSnapshots<T = CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: RateType,
): UseSnapshotsResult<T> {
  const isPool = marketType == LlamaMarketType.Lend
  const showMintGraph = !isPool && type === 'borrow'
  const contractAddress = controllerAddress
  const params = { blockchainId: chain, contractAddress }
  const { data: poolSnapshots, isLoading: poolIsLoading, error: poolError } = useLendingSnapshots(params, isPool)
  const { data: mintSnapshots, isLoading: mintIsLoading, error: mintError } = useCrvUsdSnapshots(params, showMintGraph)

  const currentValue = rates[type] ?? null
  const { snapshots, isLoading, snapshotKey, error } = isPool
    ? {
        snapshots: poolSnapshots ?? null,
        isLoading: poolIsLoading,
        snapshotKey: `${type}Apy` as const,
        error: poolError,
      }
    : {
        snapshots: (showMintGraph && mintSnapshots) || null,
        isLoading: mintIsLoading,
        snapshotKey: 'rate' as const,
        error: mintError,
      }

  const averageRate = useMemo(
    () => snapshots && meanBy(snapshots as T[], (row) => row[snapshotKey as keyof T]) * 100,
    [snapshots, snapshotKey],
  )

  return {
    snapshots,
    isLoading,
    snapshotKey,
    rate: currentValue,
    averageRate,
    error,
    period: '7D',
  } as UseSnapshotsResult<T>
}
