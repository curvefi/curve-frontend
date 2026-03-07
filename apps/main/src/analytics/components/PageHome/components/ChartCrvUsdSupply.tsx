import ReactECharts from 'echarts-for-react'
import { useState, useMemo } from 'react'
import { ButtonExport } from '@/analytics/features/charts/components/ButtonExport'
import { ButtonFullscreen } from '@/analytics/features/charts/components/ButtonFullscreen'
import { DialogFullscreen } from '@/analytics/features/charts/components/DialogFullscreen'
import { PeriodButtons } from '@/analytics/features/charts/components/PeriodButtons'
import { createChartOptions, createPalette, createTooltipFormatter } from '@/analytics/features/charts/options'
import { DAYS, type Period } from '@/analytics/features/charts/types'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatUsd } from '@ui-kit/utils'
import { useCrvUsdSupply } from '../queries/useCrvUsdSupply.query'

const { Spacing } = SizesAndSpaces

const MIN_HEIGHT = 400 // (default) min height of charts when not in fullscreen
const RESUPPLY_LAUNCH_DATE = Date.UTC(2025, 2, 20)

const SUPPLY_LABEL = t`Supply`
const DEBT_LABEL = t`Borrowed`

const timeToCategory = (x: number) => new Date(x).toISOString().slice(0, 10)

/** Chart component displaying crvUSD supply over time */
export function ChartCrvUsdSupply() {
  const [period, setPeriod] = useState<Period>('3m')
  const [fullscreen, setFullscreen] = useState(false)

  const { data, isFetching: loading } = useCrvUsdSupply({ days: DAYS[period] })

  const theme = useTheme()
  const palette = createPalette({ theme })

  const [borrowedVisible, , , toggleBorrowedVisible] = useSwitch(true)

  const legendSets: LegendItem[] = useMemo(
    () => [
      { label: SUPPLY_LABEL, line: { lineStroke: palette.colors[0], dash: 'none' } },
      {
        label: DEBT_LABEL,
        line: { lineStroke: palette.colors[1], dash: '6 6' },
        toggled: borrowedVisible,
        onToggle: toggleBorrowedVisible,
      },
    ],
    [palette.colors, borrowedVisible, toggleBorrowedVisible],
  )

  const chartData = useMemo(
    () =>
      (data ?? [])
        .groupBy((x) => new Date(x.timestamp).getTime())
        .entries()
        .map(([, x]) => ({
          time: new Date(x[0].timestamp).getTime(),
          supply: x.sumBy((y) => y.supply),
          debt: x.find((y) => y.market === 'Keepers debt')?.supply ?? 0,
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy((c) => c.time, 'asc')
        .map((x) => ({
          time: x.time,
          supply: x.supply,
          borrowed: x.supply - x.debt,
        })),
    [data],
  )

  const option = useMemo(() => {
    const times = chartData.map((x) => x.time)
    const resupplyIndex = times.findLastIndex((x) => x < RESUPPLY_LAUNCH_DATE)

    return createChartOptions({
      options: {
        tooltip: {
          trigger: 'axis',
          formatter: createTooltipFormatter(formatUsd),
        },
        xAxis: { data: times.map(timeToCategory) },
        yAxis: { axisLabel: { formatter: (v: number) => formatUsd(v) } },
        series: notFalsy(
          {
            name: SUPPLY_LABEL,
            data: chartData.map((x) => x.supply),
            type: 'line',
            markLine:
              resupplyIndex >= 0
                ? {
                    data: [{ xAxis: timeToCategory(times[resupplyIndex]) }],
                    label: {
                      formatter: t`Resupply Launch`,
                      position: 'insideEndTop',
                      color: palette.colors[2],
                    },
                    lineStyle: { color: palette.colors[2], type: 'dashed' },
                    symbol: ['none', 'arrow'],
                  }
                : undefined,
          },
          borrowedVisible && {
            name: DEBT_LABEL,
            data: chartData.map((x) => x.borrowed),
            type: 'line',
          },
        ),
      },
      palette,
    })
  }, [chartData, palette, borrowedVisible])

  return (
    <WithWrapper shouldWrap={fullscreen} Wrapper={DialogFullscreen} onClose={() => setFullscreen(false)}>
      <Card sx={{ '&.MuiPaper-root': { display: 'flex', flexDirection: 'column', height: '100%' } }}>
        <CardHeader
          title={t`crvUSD Supply`}
          action={
            <Stack direction="row" gap={Spacing.xs}>
              <PeriodButtons period={period} onPeriod={setPeriod} />
              <ButtonExport
                filename="crvusd_supply"
                data={{
                  supply: chartData.map((x) => ({ time: x.time, value: x.supply })),
                  borrowed: chartData.map((x) => ({ time: x.time, value: x.borrowed })),
                }}
              />
              <ButtonFullscreen onToggle={() => setFullscreen(!fullscreen)} />
            </Stack>
          }
        />

        <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Stack gap={Spacing.md} flexGrow={1}>
            <Box position="relative" height="100%">
              {loading && <CircularProgress sx={{ position: 'absolute', inset: 0, margin: 'auto', zIndex: 2 }} />}
              <ReactECharts
                notMerge
                option={option}
                style={{
                  height: '100%',
                  ...(!fullscreen && { minHeight: MIN_HEIGHT }),
                  ...(loading && { opacity: 0.5 }),
                }}
              />
            </Box>

            <ChartFooter
              legendSets={legendSets}
              description={t`Total crvUSD in circulation (Supply) versus the amount actively borrowed against collateral (Borrowed). The gap between the two lines reflects Pegkeeper debt — crvUSD minted by the protocol to stabilize the peg, not backed by user collateral.`}
            />
          </Stack>
        </CardContent>
      </Card>
    </WithWrapper>
  )
}
