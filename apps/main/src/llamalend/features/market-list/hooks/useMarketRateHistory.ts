import { useMemo } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import {
  getBorrowRateMetrics,
  getSnapshotBorrowApr,
  getSnapshotCollateralRebasingYieldApr,
  getSupplyRateAverageMetrics,
} from '@/llamalend/rates.utils'
import { CrvUsdSnapshot, useCrvUsdSnapshots } from '@evm-ui/entities/crvusd-snapshots'
import { LendingSnapshot, useLendingSnapshots } from '@evm-ui/entities/lending-snapshots'
import { useAprToApy } from '@evm-ui/hooks/useAprToApy'
import { MarketRateType, MarketType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES, type AverageCategory } from '@evm-ui/utils'

type UseRateHistoryResult<T> = {
  snapshots: T[] | null
  isLoading: boolean
  snapshotKey: keyof T
  rate: number | null
  averageRate: number | null
  averageTotalBorrowRate: number | null
  minBoostedRateAverage: number | null
  maxBoostedRateAverage: number | null
  error: unknown
}

const RateKeys = {
  [MarketRateType.Borrow]: 'borrowApr',
  [MarketRateType.Supply]: 'lendApr',
} as const satisfies Record<MarketRateType, 'borrowApr' | 'lendApr'>

export function useMarketRateHistory<T extends CrvUsdSnapshot | LendingSnapshot>(
  market: LlamaMarket | undefined,
  { type, category }: { type: MarketRateType; category: AverageCategory },
  enabled: boolean,
): UseRateHistoryResult<T> {
  const convertRate = useAprToApy()
  const { chain, controllerAddress, type: marketType, rates } = market ?? {}
  const isLend = marketType == MarketType.Lend
  const showLendGraph = isLend && enabled
  const showMintGraph = !isLend && type === MarketRateType.Borrow && enabled
  const { window: rateWindow } = AVERAGE_CATEGORIES[category]
  const params = {
    blockchainId: chain,
    contractAddress: controllerAddress,
    limit: rateWindow,
  }
  const { data: poolSnapshots, isLoading: lendIsLoading, error: poolError } = useLendingSnapshots(params, showLendGraph)
  const { data: mintSnapshots, isLoading: mintIsLoading, error: mintError } = useCrvUsdSnapshots(params, showMintGraph)

  const { snapshots, isLoading, snapshotKey, error } = isLend
    ? {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
        snapshots: (showLendGraph && poolSnapshots) || null,
        isLoading: !enabled || lendIsLoading,
        snapshotKey: RateKeys[type],
        error: poolError,
      }
    : {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
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
              borrowRate: rates?.borrowApr,
              snapshots: snapshots ?? undefined,
              getBorrowRate: getSnapshotBorrowApr,
              getRebasingYieldApr: getSnapshotCollateralRebasingYieldApr,
              daysBack: rateWindow,
            } as Parameters<typeof getBorrowRateMetrics>[0]),
          [MarketRateType.Supply]: () => null,
        }) satisfies Record<MarketRateType, () => ReturnType<typeof getBorrowRateMetrics> | null>
      )[type](),
    [rateWindow, rates?.borrowApr, snapshots, type],
  )

  const supplyRateMetrics = useMemo(
    () =>
      isLend && type === MarketRateType.Supply
        ? getSupplyRateAverageMetrics({
            snapshots: poolSnapshots,
            daysBack: rateWindow,
            convertRate,
          })
        : null,
    [convertRate, rateWindow, isLend, poolSnapshots, type],
  )

  return {
    snapshots,
    isLoading,
    snapshotKey,
    rate:
      type === MarketRateType.Supply
        ? convertRate(rates?.lendApr)
        : (rates?.borrowApr ?? null),
    averageRate:
      type === MarketRateType.Supply
        ? (supplyRateMetrics?.averageLendRate ?? null)
        : (borrowRateMetrics?.averageRate ?? null),
    averageTotalBorrowRate: borrowRateMetrics?.averageTotalRate ?? null,
    minBoostedRateAverage: supplyRateMetrics?.totalAverageMinBoost ?? null,
    maxBoostedRateAverage: supplyRateMetrics?.totalAverageMaxBoost ?? null,
    error,
  } as UseRateHistoryResult<T>
}
