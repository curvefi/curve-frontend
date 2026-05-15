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
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { TIME_FRAMES } from '@ui-kit/lib/model'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { refuelPoolAbi } from '../abi'
import { REFUEL_TIMESERIES_PAGE_SIZE, useRefuelTimeseries } from '../queries/timeseries.query'

const { Spacing } = SizesAndSpaces

const REFUEL_SHARES_LABEL = t`Refuel shares`
const UNLOCKED_SHARES_LABEL = t`Unlocked refuel shares`
const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]
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
      llama(data?.data)
        .map(point => ({
          time: new Date(point.timestamp).getTime(),
          donationShares: point.donationShares != null ? point.donationShares / 10 ** 18 : 0,
          unlockedShares: point.unlockedShares != null ? point.unlockedShares / 10 ** 18 : 0,
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy(point => point.time, 'asc')
        .value(),
    [data?.data],
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

  const {
    data: refuelShares,
    isLoading: isLoadingRefuelShares,
    error: refuelSharesError,
  } = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_shares',
    chainId,
  })

  const {
    data: refuelDuration,
    isLoading: isLoadingRefuelDuration,
    error: refuelDurationError,
  } = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_duration',
    chainId,
  })

  const {
    data: maxRatio,
    isLoading: isLoadingMaxRatio,
    error: maxRatioError,
  } = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_shares_max_ratio',
    chainId,
  })

  return (
    <EChartsCard
      title={t`Refuel budget`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      testId="refuel-budget-chart"
      topContent={
        <Grid container columnSpacing={Spacing.md} rowSpacing={Spacing.sm}>
          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              label={REFUEL_SHARES_LABEL}
              value={Number(refuelShares && formatUnits(refuelShares, 18))}
              valueOptions={{ abbreviate: true }}
              loading={isLoadingRefuelShares}
              error={refuelSharesError}
              testId="refuel-shares"
            />
          </Grid>

          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              label={t`Refuel duration`}
              value={(Number(refuelDuration) / TIME_FRAMES.DAY_MS) * 1000}
              valueOptions={{ abbreviate: false, decimals: 0 }}
              rightAdornment={
                <Typography variant="highlightS" color="textSecondary">
                  {t`days`}
                </Typography>
              }
              loading={isLoadingRefuelDuration}
              error={refuelDurationError}
              testId="refuel-duration"
            />
          </Grid>

          <Grid size={{ mobile: 6, tablet: 4 }}>
            <Metric
              label={t`Max ratio`}
              value={Number(maxRatio && formatUnits(maxRatio, 18)) * 100}
              valueOptions={{ abbreviate: true, decimals: 2, unit: 'percentage' }}
              loading={isLoadingMaxRatio}
              error={maxRatioError}
              testId="refuel-max-ratio"
            />
          </Grid>
        </Grid>
      }
      action={
        <>
          <SelectTimeOption options={PERIODS} activeOption={period} setActiveOption={setPeriod} isLoading={loading} />
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
