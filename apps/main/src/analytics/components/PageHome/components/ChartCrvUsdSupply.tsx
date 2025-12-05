import { useState, useEffect } from 'react'
import { ButtonChartExport } from '@/analytics/features/charts/components/ButtonChartExport'
import { ButtonChartFullscreen } from '@/analytics/features/charts/components/ButtonChartFullscreen'
import { Legend } from '@/analytics/features/charts/components/Legend'
import { PeriodButtons } from '@/analytics/features/charts/components/PeriodButtons'
import { createAreaSerie, createChartOptions, createSerieMarkers } from '@/analytics/features/charts/factories'
import { createLineSerie } from '@/analytics/features/charts/factories/serie'
import { useLegend, useLightweightChart, usePalette } from '@/analytics/features/charts/hooks'
import { DAYS, type Period } from '@/analytics/features/charts/types'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatUsd } from '@ui-kit/utils'
import { useCrvUsdSupply } from '../queries/useCrvUsdSupply.query'

const { Spacing } = SizesAndSpaces

/** Chart component displaying crvUSD supply over time */
export function ChartCrvUsdSupply() {
  const [period, setPeriod] = useState<Period>('3m')

  const { data, isFetching: loading } = useCrvUsdSupply({ days: DAYS[period] })

  const palette = usePalette()

  const { items } = useLegend([
    {
      id: 'supply' as const,
      label: 'Supply',
      color: palette.colors[0],
      togglable: true, // todo: fix!
    },
    {
      id: 'borrowed' as const,
      label: 'Borrowed',
      color: palette.colors[1],
    },
  ])

  const { chart, chartRef, series } = useLightweightChart({
    createChartOptions: createChartOptions({ palette }),
    series: [
      createAreaSerie({
        name: 'supply' as const,
        color: palette.colors[0],
        formatter: formatUsd,
      }),
      createLineSerie({
        name: 'debt' as const,
        color: palette.colors[1],
        formatter: formatUsd,
      }),
    ],
  })

  // Update series data when data changes
  useEffect(() => {
    if (!chart || !series.supply || !series.debt || !data?.length) {
      return
    }

    // TODO: I have to parse every timestamp with new Date, because TanStack only stores the string in its cache
    const dataSupply = data
      .groupBy((x) => new Date(x.timestamp).getTime())
      .entries()
      .map(([, x]) => ({
        time: new Date(x[0].timestamp).getUTCTimestamp(),
        value: x.sumBy((y) => y.supply),
        debt: x.find((y) => y.market === 'Keepers debt')?.supply ?? 0,
      }))
      .uniqWith((x, y) => x.time === y.time)
      .orderBy((c) => c.time, 'asc')

    const dataDebt = dataSupply.map((x) => ({
      time: x.time,
      value: x.value - x.debt,
    }))

    series.supply.setData(dataSupply)
    series.debt.setData(dataDebt)

    chart.timeScale().fitContent()

    // Add Resupply marker for March 20, 2025
    const marker = {
      time: new Date(Date.UTC(2025, 2, 20)).getUTCTimestamp(),
      position: 'aboveBar' as const,
      color: palette.colors[2],
      shape: 'arrowDown' as const,
      text: t`Resupply Launch`,
    }

    createSerieMarkers(series.supply, [marker])
  }, [chart, series, data, palette.colors])

  const chartContent = (
    <Box>
      {loading && <CircularProgress sx={{ position: 'absolute', inset: 0, margin: 'auto', zIndex: 2 }} />}
      <Box ref={chartRef} sx={{ ...(loading && { opacity: 0.5 }) }} />
    </Box>
  )

  return (
    <Card>
      <CardHeader
        title={t`crvUSD Supply`}
        action={
          <Stack direction="row" gap={Spacing.xs}>
            <ButtonChartExport filename="crvusd_supply" series={series} />
            <ButtonChartFullscreen chart={chart}>{chartContent}</ButtonChartFullscreen>
          </Stack>
        }
      />

      <CardContent sx={{ position: 'relative' }}>
        {chartContent}

        <Stack direction="row" justifyContent="space-between" alignItems="center" marginTop={Spacing.sm}>
          <Legend items={items} />
          <PeriodButtons period={period} onPeriod={setPeriod} />
        </Stack>
      </CardContent>
    </Card>
  )
}
