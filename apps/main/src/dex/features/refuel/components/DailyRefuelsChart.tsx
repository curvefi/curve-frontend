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
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { formatNumber } from '@ui-kit/utils'
import { useRefuelDailyRefuels } from '../queries/daily-refuels.query'

const REFUELS_LABEL = t`Daily refuels`
const REFUELS_COUNT_LABEL = t`Refuel count`
const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]
const REFUELS_VALUE_KEY = 'totalUsd'
const REFUELS_COUNT_KEY = 'count'

const formatDonationTooltip = (value: number, seriesName: string) =>
  seriesName === REFUELS_COUNT_LABEL
    ? formatNumber(value, { abbreviate: false, decimals: 0 })
    : formatNumber(value, 'usd.notional')

export const DailyRefuelsChart = ({ blockchainId, poolAddress }: { blockchainId: Chain; poolAddress: Address }) => {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const { start, end } = useMemo(() => getTimeRange({ daysRange: DAYS[period] }), [period])

  const toggleVisibility = (key: string) => setVisibility(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))

  const { data, isFetching: loading } = useRefuelDailyRefuels({
    blockchainId,
    poolAddress,
    start,
    end,
  })

  const theme = useTheme()
  const palette = createPalette({ theme })

  const legendSets: LegendItem[] = useMemo(
    () => [
      {
        label: REFUELS_LABEL,
        line: { lineStroke: palette.colors[0] },
        toggled: visibility[REFUELS_VALUE_KEY] ?? true,
        onToggle: () => toggleVisibility(REFUELS_VALUE_KEY),
      },
      {
        label: REFUELS_COUNT_LABEL,
        box: { fill: palette.colors[1] },
        toggled: visibility[REFUELS_COUNT_KEY] ?? true,
        onToggle: () => toggleVisibility(REFUELS_COUNT_KEY),
      },
    ],
    [palette.colors, visibility],
  )

  const chartData = useMemo(
    () =>
      llama(data?.data)
        .map(point => ({ time: new Date(point.timestamp).getTime(), totalUsd: point.totalUsd, count: point.count }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy(point => point.time, 'asc')
        .value(),
    [data?.data],
  )

  const option = useMemo(() => {
    const yAxisBase = {
      type: 'value' as const,
      axisLine: { show: true, lineStyle: { color: palette.gridLinesColor } },
      axisTick: { show: true, lineStyle: { color: palette.gridLinesColor } },
      axisLabel: { color: palette.axisLabelsColor },
    }

    return createChartOptions({
      legendSets,
      options: {
        tooltip: createTooltip(formatDonationTooltip),
        xAxis: { boundaryGap: true, data: chartData.map(point => point.time).map(timeToCategory) },
        yAxis: [
          {
            ...yAxisBase,
            position: 'right',
            splitLine: { lineStyle: { color: palette.gridLinesColor } },
            axisLabel: { ...yAxisBase.axisLabel, formatter: (value: number) => formatNumber(value, 'usd.notional') },
          },
          {
            type: 'value',
            show: false,
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: REFUELS_LABEL,
            data: chartData.map(point => point.totalUsd),
            type: 'line',
            z: 2,
          },
          {
            name: REFUELS_COUNT_LABEL,
            data: chartData.map(point => point.count),
            type: 'bar',
            yAxisIndex: 1,
          },
        ],
      },
      palette,
    })
  }, [chartData, legendSets, palette])

  return (
    <EChartsCard
      title={t`Daily refuels`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      testId="refuel-daily-refuels-chart"
      action={
        <>
          <SelectTimeOption options={PERIODS} activeOption={period} setActiveOption={setPeriod} isLoading={loading} />
          {fullscreen && (
            <ButtonExport
              filename="refuel_daily_donations"
              data={{
                donations: chartData.map(point => ({ time: point.time, value: point.totalUsd })),
                donationCount: chartData.map(point => ({ time: point.time, value: point.count })),
              }}
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
