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
  error: unknown
}

export function useSnapshots<T = CrvUsdSnapshot | LendingSnapshot>(
  { chain, controllerAddress, type: marketType, rates }: LlamaMarket,
  type: GraphType,
  enabled: boolean,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === 'borrow' && enabled
  const contractAddress = controllerAddress
  const params = { blockchainId: chain, contractAddress }
  const { data: poolSnapshots, isLoading: lendIsLoading, error: poolError } = useLendingSnapshots(params, showLendGraph)
  const { data: mintSnapshots, isLoading: mintIsLoading, error: mintError } = useCrvUsdSnapshots(params, showMintGraph)

  const currentValue = rates[type] ?? null
  const { snapshots, isLoading, snapshotKey, error } = isLend
    ? {
        snapshots: (showLendGraph && poolSnapshots) || null,
        isLoading: !enabled || lendIsLoading,
        snapshotKey: `${type}Apy` as const,
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

  return { snapshots, isLoading, snapshotKey, rate: currentValue, averageRate, error } as UseSnapshotsResult<T>
}
