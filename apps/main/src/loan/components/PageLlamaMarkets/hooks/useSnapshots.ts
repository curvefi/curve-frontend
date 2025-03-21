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
  { chain, controllerAddress, type: marketType, rates, snapshots }: LlamaMarket,
  type: GraphType,
  enabled: boolean,
): UseSnapshotsResult<T> {
  const isLend = marketType == LlamaMarketType.Lend

  const currentValue = rates[type] ?? null
  const { isLoading, snapshotKey, error } = isLend
    ? {
        isLoading: false,
        snapshotKey: `${type}Apy` as const,
        error: null,
      }
    : {
        isLoading: false,
        snapshotKey: 'rate' as const,
        error: null,
      }

  const averageRate = useMemo(
    () => snapshots && meanBy(snapshots as T[], (row) => row[snapshotKey as keyof T]) * 100,
    [snapshots, snapshotKey],
  )

  return { snapshots, isLoading, snapshotKey, rate: currentValue, averageRate, error } as UseSnapshotsResult<T>
}
