import lodash from 'lodash'
import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { MarketRateType, LlamaMarketType } from '@ui-kit/types/market'

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

const SnapshotKeys = {
  [MarketRateType.Borrow]: 'borrowApy',
  [MarketRateType.Supply]: 'lendApr',
} as const

const RateKeys = {
  [MarketRateType.Borrow]: 'borrow',
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
  const params = { blockchainId: chain, contractAddress }
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
    () => snapshots && lodash.meanBy(snapshots as T[], (row) => row[snapshotKey as keyof T]) * 100,
    [snapshots, snapshotKey],
  )

  const maxBoostedAprAverage = useMemo(
    () =>
      snapshots &&
      isLend &&
      type === MarketRateType.Supply &&
      lodash.meanBy(snapshots as LendingSnapshot[], (row) => row.lendApr + row.lendAprCrvMaxBoost) * 100,
    [snapshots, isLend, type],
  )

  return {
    snapshots,
    isLoading,
    snapshotKey,
    rate: rates[RateKeys[type]],
    averageRate,
    maxBoostedAprAverage,
    error,
    period: '7D',
  } as UseSnapshotsResult<T>
}
