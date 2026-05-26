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
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { REFUEL_TIMESERIES_PAGE_SIZE, useRefuelTimeseries } from '../queries/timeseries.query'

const { Spacing } = SizesAndSpaces

const LAST_PRICE_LABEL = t`Last price`
const ORACLE_PRICE_LABEL = t`Oracle price`
const PRICE_SCALE_LABEL = t`Price scale`
const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]

const PRICE_AXIS_PADDING_RATIO = 0.1
const PRICE_AXIS_FALLBACK_PADDING_RATIO = 0.01
const PRICE_SERIES = [
  { key: 'lastPrice', label: LAST_PRICE_LABEL },
  { key: 'oraclePrice', label: ORACLE_PRICE_LABEL },
  { key: 'priceScale', label: PRICE_SCALE_LABEL },
] as const

const formatPrice = (value: number | null | undefined) =>
  formatNumber(value, { abbreviate: false, decimals: 6, fallback: '-' })

// Helper functions and filters that don't type check nicely when inlined
const toExportPoint = (time: number, value: number | null) => (value == null ? [] : [{ time, value }])
const isFinitePrice = (value: number | null): value is number => value != null && Number.isFinite(value)
const getLatestMetric = (values: (number | null | undefined)[]) =>
  values.findLast((value): value is number => value != null && Number.isFinite(value))

/** Used to calculate padded minimum for the price axis with some extra padding */
const getPaddedMin = (values: number[]) => {
  if (!values.length) return undefined

  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * PRICE_AXIS_PADDING_RATIO || Math.abs(min) * PRICE_AXIS_FALLBACK_PADDING_RATIO
  const paddedMin = min - padding

  return min > 0 ? Math.max(paddedMin, min / 2) : paddedMin
}

export const RefuelPricesChart = ({ blockchainId, poolAddress }: { blockchainId: Chain; poolAddress: Address }) => {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const { start, end } = useMemo(() => getTimeRange({ daysRange: DAYS[period] }), [period])

  const toggleVisibility = (key: string) => setVisibility(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))

  const { data, isFetching: loading } = useRefuelTimeseries({
    blockchainId,
    poolAddress,
    start,
    end,
    pageSize: REFUEL_TIMESERIES_PAGE_SIZE,
  })

  const theme = useTheme()
  const palette = createPalette({ theme })

  const legendSets: LegendItem[] = useMemo(
    () =>
      PRICE_SERIES.map(({ key, label }, index) => ({
        label,
        line: { lineStroke: palette.colors[index] },
        toggled: visibility[key] ?? true,
        onToggle: () => toggleVisibility(key),
      })),
    [palette.colors, visibility],
  )

  const chartData = useMemo(
    () =>
      llama(data?.data)
        .map(point => ({
          time: new Date(point.timestamp).getTime(),
          lastPrice: point.lastPrices?.[0] ?? null,
          oraclePrice: point.priceOracle?.[0] ?? null,
          priceScale: point.priceScale?.[0] ?? null,
          lpUsdPrice: point.lpUsdPrice,
          virtualPrice: point.virtualPrice,
        }))
        .filter(point => point.lastPrice != null || point.oraclePrice != null || point.priceScale != null)
        .uniqWith((x, y) => x.time === y.time)
        .orderBy(point => point.time, 'asc')
        .value(),
    [data?.data],
  )

  const lpUsdPrice = useMemo(() => getLatestMetric(chartData.map(point => point.lpUsdPrice)), [chartData])
  const virtualPrice = useMemo(() => getLatestMetric(chartData.map(point => point.virtualPrice)), [chartData])

  const yAxisMin = useMemo(
    () =>
      getPaddedMin(
        chartData
          .flatMap(point => PRICE_SERIES.filter(({ key }) => visibility[key] ?? true).map(({ key }) => point[key]))
          .filter(isFinitePrice),
      ),
    [chartData, visibility],
  )

  const option = useMemo(
    () =>
      createChartOptions({
        legendSets,
        options: {
          tooltip: createTooltip(formatPrice),
          xAxis: { data: chartData.map(point => point.time).map(timeToCategory) },
          yAxis: { axisLabel: { formatter: formatPrice, margin: 6, showMinLabel: false }, min: yAxisMin },
          series: PRICE_SERIES.map(({ key, label }) => ({
            name: label,
            data: chartData.map(point => point[key]),
            type: 'line',
          })),
        },
        palette,
      }),
    [chartData, legendSets, palette, yAxisMin],
  )

  return (
    <EChartsCard
      title={`${data?.tokens[1]?.symbol ?? '?'} prices in ${data?.tokens[0]?.symbol ?? '?'}`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      testId="refuel-prices-chart"
      metrics={
        <Grid container columnSpacing={Spacing.md} rowSpacing={Spacing.sm}>
          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              label={t`LP token value`}
              value={lpUsdPrice}
              valueOptions={{ abbreviate: true, unit: 'dollar' }}
              loading={loading}
              testId="refuel-lp-token-value"
            />
          </Grid>

          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              label={t`Virtual price`}
              value={virtualPrice && virtualPrice / 10 ** 18}
              valueOptions={{ abbreviate: false, decimals: 6 }}
              loading={loading}
              testId="refuel-virtual-price"
            />
          </Grid>
        </Grid>
      }
      action={
        <>
          <SelectTimeOption options={PERIODS} activeOption={period} setActiveOption={setPeriod} isLoading={loading} />
          {fullscreen && (
            <ButtonExport
              filename="refuel_prices"
              data={{
                lastPrice: chartData.flatMap(point => toExportPoint(point.time, point.lastPrice)),
                oraclePrice: chartData.flatMap(point => toExportPoint(point.time, point.oraclePrice)),
                priceScale: chartData.flatMap(point => toExportPoint(point.time, point.priceScale)),
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
