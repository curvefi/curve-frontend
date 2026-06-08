import type { Chain } from '@curvefi/prices-api'
import { getLpOHLC, getOHLC, type GetLpOHLCParams } from '@curvefi/prices-api/ohlc'
import { assert } from '@primitives/objects.utils'
import { useOhlcInfiniteQuery } from '@ui-kit/features/candle-chart/hooks/useOhlcQueries'
import {
  createCandleChartQueryKey,
  createOhlcPageResult,
  type OhlcPageParam,
  type OhlcPageResult,
} from '@ui-kit/features/candle-chart/query-utils'
import type { ChartSelection, LpPriceOhlcDataFormatted, TimeOption } from '@ui-kit/features/candle-chart/types'
import { formatCandleOhlcData } from '@ui-kit/features/candle-chart/utils'
import { t } from '@ui-kit/lib/i18n'

type DexOhlcQueryParams = {
  anchorEnd: number
  chain: Chain | undefined
  chartSelection: ChartSelection
  enabled?: boolean
  interval: number
  poolAddress: string
  timeOption: TimeOption
  units: 'minute' | 'hour' | 'day'
}

type DexOhlcPage = OhlcPageResult & {
  ohlcData: LpPriceOhlcDataFormatted[]
}

type LpChartSelectionType = Exclude<ChartSelection['type'], 'pair'>
type LpPriceUnits = NonNullable<GetLpOHLCParams['priceUnits']>

const LP_PRICE_UNITS_BY_CHART_SELECTION: Record<LpChartSelectionType, LpPriceUnits> = {
  'lp-usd': 'usd',
  'lp-token': 'token0',
}

export const getDexChartSelectionKey = (chartSelection: ChartSelection) => {
  if (chartSelection.type === 'pair') {
    return `pair:${chartSelection.mainToken.address}:${chartSelection.refToken.address}`
  }

  return chartSelection.type
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
      priceUnits: LP_PRICE_UNITS_BY_CHART_SELECTION[chartSelection.type],
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
  enabled = true,
  interval,
  poolAddress,
  timeOption,
  units,
}: DexOhlcQueryParams) => {
  const chartSelectionKey = getDexChartSelectionKey(chartSelection)

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
    enabled: enabled && !!chain && !!poolAddress,
    fetchPage: async ({ pageParam, signal }): Promise<DexOhlcPage> => {
      const validChain = assert(chain, t`Cannot fetch DEX OHLC data without a chain.`)
      const responseData = await fetchDexOhlc(
        {
          anchorEnd,
          chain: validChain,
          chartSelection,
          interval,
          poolAddress,
          timeOption,
          units,
          start: pageParam.start,
          end: pageParam.end,
        },
        signal,
      )
      const ohlcData = formatCandleOhlcData(responseData)

      return {
        ohlcData,
        ...createOhlcPageResult(responseData),
      }
    },
  })
}
