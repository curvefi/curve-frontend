import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import {
  ButtonExport,
  ButtonFullscreen,
  ChartFooter,
  createChartOptions,
  createPalette,
  createTooltip,
  DAYS,
  EChartsCard,
  timeToCategory,
  type Period,
} from '@/analytics/features/charts'
import { llama } from '@/analytics/llamadash'
import type { Chain } from '@curvefi/prices-api'
import { getTimeRange } from '@curvefi/prices-api/timestamp'
import { useTheme } from '@mui/material/styles'
import { mapRecord } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { formatNumber } from '@ui-kit/utils'
import { REFUEL_TIMESERIES_PAGE_SIZE, useRefuelTimeseries } from '../queries/timeseries.query'

const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]

const formatReserveShare = (value: number | null | undefined) => formatNumber(value, 'percent.value')

const getTokenLabel = (symbol: string | undefined, index: number) => symbol || t`Token ${index + 1}`

const getReserveUsdShares = ({
  reserves,
  prices,
  decimals,
}: {
  reserves: (number | null | undefined)[] | null | undefined
  prices: (number | null | undefined)[] | null | undefined
  decimals: (number | undefined)[]
}) => {
  const reserveUsdValues =
    reserves?.map((reserve, index) => {
      const amount = reserve == null || decimals[index] == null ? 0 : reserve / 10 ** decimals[index]
      const relativeUsdPrice = index === 0 ? 1 : (prices?.[index - 1] ?? 1)
      return amount * relativeUsdPrice
    }) ?? []
  const totalUsd = reserveUsdValues.reduce((sum, value) => sum + value, 0)

  return reserveUsdValues.map(value => (totalUsd ? (value / totalUsd) * 100 : 0))
}

export const ReservesCompositionChart = ({
  blockchainId,
  poolAddress,
}: {
  blockchainId: Chain
  poolAddress: Address
}) => {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)
  const { start, end } = useMemo(() => getTimeRange({ daysRange: DAYS[period] }), [period])

  const { data, isFetching: loading } = useRefuelTimeseries({
    blockchainId,
    poolAddress,
    start,
    end,
    pageSize: REFUEL_TIMESERIES_PAGE_SIZE,
  })

  const theme = useTheme()
  const palette = createPalette({ theme })
  const tokens = useMemo(() => data?.tokens ?? [], [data?.tokens])

  const chartData = useMemo(
    () =>
      llama(data?.data)
        .map(point => ({
          time: new Date(point.timestamp).getTime(),
          reserves: getReserveUsdShares({
            reserves: point.reserves,
            prices: point.priceOracle?.length ? point.priceOracle : point.lastPrices,
            decimals: tokens.map(token => token.decimals),
          }),
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy(point => point.time, 'asc')
        .value(),
    [data?.data, tokens],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      tokens.map((token, index) => ({
        label: getTokenLabel(token.symbol, index),
        box: { fill: palette.colors[index] },
      })),
    [palette.colors, tokens],
  )

  const option = useMemo(
    () =>
      createChartOptions({
        legendSets,
        options: {
          tooltip: createTooltip(formatReserveShare),
          xAxis: { data: chartData.map(point => point.time).map(timeToCategory) },
          yAxis: {
            axisLabel: { formatter: formatReserveShare },
            min: 0,
            max: 100,
          },
          series: tokens.map((token, index) => ({
            name: getTokenLabel(token.symbol, index),
            data: chartData.map(point => point.reserves[index] ?? 0),
            type: 'line' as const,
            stack: 'reserves',
            areaStyle: {},
          })),
        },
        palette,
      }),
    [chartData, legendSets, palette, tokens],
  )

  return (
    <EChartsCard
      title={t`Reserves Composition (% of TVL)`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      testId="refuel-reserves-composition-chart"
      action={
        <>
          <SelectTimeOption options={PERIODS} activeOption={period} setActiveOption={setPeriod} isLoading={loading} />
          {fullscreen && (
            <ButtonExport
              filename="refuel_reserves_composition"
              data={mapRecord(
                Object.fromEntries(tokens.map((token, index) => [getTokenLabel(token.symbol, index), index])),
                (_, index) => chartData.map(point => ({ time: point.time, value: point.reserves[index] ?? 0 })),
              )}
              fullscreen={fullscreen}
            />
          )}
          <ButtonFullscreen onToggle={toggleFullscreen} fullscreen={fullscreen} />
        </>
      }
    >
      <ChartFooter legendSets={legendSets} />
    </EChartsCard>
  )
}
