import { useState, useMemo } from 'react'
import {
  ButtonExport,
  ButtonFullscreen,
  ChartFooter,
  createChartOptions,
  createPalette,
  createTooltip,
  timeToCategory,
  DAYS,
  EChartsCard,
  type Period,
} from '@/analytics/features/charts'
import { llama } from '@/analytics/llamadash'
import { useTheme } from '@mui/material/styles'
import type { Amount } from '@primitives/decimal.utils'
import { useCrvUsdPriceHistory } from '@ui-kit/entities/crvusd-price.query'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { formatNumber, formatUsd } from '@ui-kit/utils'

const PRICE_LABEL = t`Price`
const PERIODS = ['7d', '1m', '3m', '6m'] as const satisfies Period[]

// Custom formatter to absolute ensure 4 decimals at all times, which deviates from the norm (where $1.000 becomes $1)
const formatter = (val: Amount) =>
  Number(val).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })

/** Chart component displaying crvUSD price over time */
export function ChartCrvUsdPrice() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)

  const { data, isFetching: loading } = useCrvUsdPriceHistory({ days: DAYS[period] })

  const theme = useTheme()
  const palette = createPalette({ theme })

  const legendSets: LegendItem[] = useMemo(
    () => [{ label: PRICE_LABEL, line: { lineStroke: palette.colors[0], dash: 'none' } }],
    [palette.colors],
  )

  const chartData = useMemo(
    () =>
      llama(data)
        .map((x) => ({
          time: new Date(x.timestamp).getTime(),
          price: x.price,
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy((c) => c.time, 'asc')
        .value(),
    [data],
  )

  const option = useMemo(
    () =>
      createChartOptions({
        legendSets,
        options: {
          tooltip: createTooltip(formatUsd),
          xAxis: { data: chartData.map((x) => x.time).map(timeToCategory) },
          yAxis: {
            axisLabel: {
              formatter: (v: number) =>
                formatNumber(v, {
                  unit: 'dollar',
                  abbreviate: false,
                  formatter,
                }),
            },
            // 0.95 and 1.05 cover 99% of a stablecoin's price range. And you don't want spikes to cause the chart to become unreadable.
            min: Math.max(Math.min(...chartData.map((x) => x.price)), 0.95),
            max: Math.min(Math.max(...chartData.map((x) => x.price)), 1.05),
          },
          series: {
            name: PRICE_LABEL,
            data: chartData.map((x) => x.price),
            type: 'line',
          },
        },
        palette,
      }),
    [legendSets, chartData, palette],
  )

  return (
    <EChartsCard
      title={t`crvUSD Price`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      action={
        <>
          <SelectTimeOption options={PERIODS} activeOption={period} setActiveOption={setPeriod} isLoading={loading} />
          <ButtonExport
            filename="crvusd_price"
            data={{ price: chartData.map((x) => ({ time: x.time, value: x.price })) }}
            fullscreen={fullscreen}
          />
          <ButtonFullscreen onToggle={toggleFullscreen} fullscreen={fullscreen} />
        </>
      }
    >
      <ChartFooter legendSets={legendSets} description={t`The aggregate price of crvUSD on all Curve pools.`} />
    </EChartsCard>
  )
}
