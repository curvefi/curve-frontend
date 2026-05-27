import { useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import { getLpOHLC, getOHLC } from '@curvefi/prices-api/ohlc'
import {
  assertInitialOhlcPageHasData,
  createCandleChartQueryKey,
  createOhlcPageResult,
  formatCandleOhlcData,
  type OhlcPageParam,
  type OhlcPageResult,
  useOhlcInfiniteQuery,
} from '@ui-kit/features/candle-chart'
import type { ChartSelection, LpPriceOhlcDataFormatted, TimeOption } from '@ui-kit/features/candle-chart/types'

type DexOhlcQueryParams = {
  anchorEnd: number
  chain: Chain | undefined
  chartSelection: ChartSelection
  interval: number
  poolAddress: string
  timeOption: TimeOption
  units: 'minute' | 'hour' | 'day'
}

type DexOhlcPage = OhlcPageResult & {
  page: OhlcPageParam
  ohlcData: LpPriceOhlcDataFormatted[]
}

export const getDexChartSelectionKey = (chartSelection: ChartSelection) => {
  if (chartSelection.type !== 'pair') return chartSelection.type

  return `pair:${chartSelection.mainToken.address}:${chartSelection.refToken.address}`
}

const fetchDexOhlc = (
  {
    chain,
    chartSelection,
    interval,
    poolAddress,
    start,
    end,
    units,
  }: DexOhlcQueryParams & OhlcPageParam & { chain: Chain },
  signal: AbortSignal,
) => {
  if (chartSelection.type === 'pair') {
    return getOHLC(
      {
        chain,
        poolAddress,
        mainToken: chartSelection.mainToken.address,
        referenceToken: chartSelection.refToken.address,
        interval,
        units,
        start,
        end,
      },
      { signal },
    )
  }

  return getLpOHLC(
    {
      chain,
      poolAddress,
      priceUnits: chartSelection.type === 'lp-usd' ? 'usd' : 'token0',
      interval,
      units,
      start,
      end,
    },
    { signal },
  )
}

export const useDexOhlcQuery = ({
  anchorEnd,
  chain,
  chartSelection,
  interval,
  poolAddress,
  timeOption,
  units,
}: DexOhlcQueryParams) => {
  const chartSelectionKey = useMemo(() => getDexChartSelectionKey(chartSelection), [chartSelection])

  return useOhlcInfiniteQuery({
    queryKey: createCandleChartQueryKey(
      'dex',
      { chain },
      { poolAddress },
      { chartSelectionKey },
      { interval },
      { units },
      { timeOption },
      { anchorEnd },
    ),
    anchorEnd,
    timeOption,
    enabled: !!chain && !!poolAddress,
    fetchPage: async ({ pageParam, signal }): Promise<DexOhlcPage> => {
      if (!chain) {
        throw new Error('Cannot fetch DEX OHLC data without a chain.')
      }

      const page = pageParam
      const responseData = await fetchDexOhlc(
        {
          anchorEnd,
          chain,
          chartSelection,
          interval,
          poolAddress,
          timeOption,
          units,
          start: page.start,
          end: page.end,
        },
        signal,
      )
      const ohlcData = formatCandleOhlcData(responseData)

      assertInitialOhlcPageHasData({
        anchorEnd,
        dataLength: ohlcData.length,
        message: 'No OHLC data found. Data may be unavailable for this pool.',
        page,
      })

      return {
        page,
        ohlcData,
        ...createOhlcPageResult(responseData),
      }
    },
  })
}
