import { meanBy } from 'lodash'
import { useMemo } from 'react'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@/loan/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@/loan/entities/lending-snapshots'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'

export type GraphType = 'borrow' | 'lend'

type UseSnapshotsResult<T> = {
  snapshots: T[] | null
  isLoading: boolean
  snapshotKey: keyof T
  rate: number | null
  averageRate: number | null
}

export function useSnapshots<T = CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: GraphType,
): UseSnapshotsResult<T> {
  const isPool = marketType == LlamaMarketType.Lend
  const showMintGraph = !isPool && type === 'borrow'
  const contractAddress = controllerAddress
  const params = { blockchainId: chain, contractAddress }
  const { data: poolSnapshots, isLoading: poolIsLoading } = useLendingSnapshots(params, isPool)
  const { data: mintSnapshots, isLoading: mintIsLoading } = useCrvUsdSnapshots(params, showMintGraph)

  const currentValue = rates[type] ?? null
  const { snapshots, isLoading, snapshotKey } = isPool
    ? {
        snapshots: poolSnapshots ?? null,
        isLoading: poolIsLoading,
        snapshotKey: `${type}Apy` as const,
      }
    : {
        snapshots: (showMintGraph && mintSnapshots) || null,
        isLoading: mintIsLoading,
        snapshotKey: 'rate' as const,
      }

  const averageRate = useMemo(
    () => snapshots && meanBy(snapshots as T[], (row) => row[snapshotKey as keyof T]) * 100,
    [snapshots, snapshotKey],
  )

  return { snapshots, isLoading, snapshotKey, rate: currentValue, averageRate } as UseSnapshotsResult<T>
}
