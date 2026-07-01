import { useMemo, useState } from 'react'
import { formatUnits, type Address } from 'viem'
import { useReadContract } from 'wagmi'
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
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { refuelPoolAbi } from '../abi'
import { REFUEL_TIMESERIES_PAGE_SIZE, useRefuelTimeseries } from '../queries/timeseries.query'

const { Spacing } = SizesAndSpaces

const REFUEL_SHARES_LABEL = t`Refuel shares`
const UNLOCKED_SHARES_LABEL = t`Unlocked refuel shares`
const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]
const METRIC_CATEGORY = 'dex.refuelCharts'
const SHARE_SERIES = [
  { key: 'donationShares', label: REFUEL_SHARES_LABEL },
  { key: 'unlockedShares', label: UNLOCKED_SHARES_LABEL },
] as const

const formatShares = (value: number | null | undefined) => formatNumber(value, { abbreviate: true, fallback: '-' })

export const RefuelSharesChart = ({
  chainId,
  blockchainId,
  poolAddress,
}: {
  chainId: number
  blockchainId: Chain
  poolAddress: Address
}) => {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const { start, end } = useMemo(() => getTimeRange({ daysRange: DAYS[period] }), [period])

  const toggleVisibility = (key: string) => setVisibility(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))

  const timeSeries = useRefuelTimeseries({
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
      SHARE_SERIES.map(({ key, label }, index) => ({
        label,
        line: { lineStroke: palette.colors[index] },
        toggled: visibility[key] ?? true,
        onToggle: () => toggleVisibility(key),
      })),
    [palette.colors, visibility],
  )

  const chartData = useMemo(
    () =>
      llama(timeSeries.data?.data)
        .map(point => ({
          time: new Date(point.timestamp).getTime(),
          donationShares: point.donationShares == null ? 0 : point.donationShares / 10 ** DEFAULT_DECIMALS,
          unlockedShares: point.unlockedShares == null ? 0 : point.unlockedShares / 10 ** DEFAULT_DECIMALS,
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy(point => point.time, 'asc')
        .value(),
    [timeSeries.data?.data],
  )

  const option = useMemo(
    () =>
      createChartOptions({
        legendSets,
        options: {
          tooltip: createTooltip(formatShares),
          xAxis: { data: chartData.map(point => point.time).map(timeToCategory) },
          yAxis: { axisLabel: { formatter: formatShares } },
          series: SHARE_SERIES.map(({ key, label }) => ({
            name: label,
            data: chartData.map(point => point[key]),
            type: 'line',
          })),
        },
        palette,
      }),
    [chartData, legendSets, palette],
  )

  const refuelShares = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_shares',
    chainId,
  })

  const refuelDuration = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_duration',
    chainId,
  })

  const maxRatio = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_shares_max_ratio',
    chainId,
  })

  return (
    <EChartsCard
      title={t`Refuel budget`}
      loading={timeSeries.isFetching}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      testId="refuel-budget-chart"
      metrics={
        <Grid container columnSpacing={Spacing.md} rowSpacing={Spacing.sm}>
          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              category={METRIC_CATEGORY}
              label={REFUEL_SHARES_LABEL}
              value={mapQuery(refuelShares, value => formatUnits(value, 18) as Decimal)}
              valueOptions={{ abbreviate: true }}
              testId="refuel-shares"
            />
          </Grid>

          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              category={METRIC_CATEGORY}
              label={t`Refuel duration`}
              value={mapQuery(refuelDuration, value => (Number(value) / TIME_FRAMES.DAY_MS) * 1000)}
              valueOptions={{ abbreviate: false, decimals: 0 }}
              icon={
                <Typography variant="highlightS" color="textSecondary">
                  {t`days`}
                </Typography>
              }
              testId="refuel-duration"
            />
          </Grid>

          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              category={METRIC_CATEGORY}
              label={t`Max ratio`}
              value={mapQuery(maxRatio, value => Number(formatUnits(value, 18)) * 100)}
              valueOptions={{ abbreviate: true, decimals: 2, unit: 'percentage' }}
              testId="refuel-max-ratio"
            />
          </Grid>
        </Grid>
      }
      action={
        <>
          <SelectTimeOption
            options={PERIODS}
            activeOption={period}
            setActiveOption={setPeriod}
            isLoading={timeSeries.isFetching}
          />
          {fullscreen && (
            <ButtonExport
              filename="refuel_donation_shares"
              data={{
                donationShares: chartData.map(point => ({ time: point.time, value: point.donationShares ?? 0 })),
                unlockedShares: chartData.map(point => ({ time: point.time, value: point.unlockedShares ?? 0 })),
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
