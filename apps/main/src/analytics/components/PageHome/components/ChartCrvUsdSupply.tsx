import { useState, useMemo } from 'react'
import {
  ButtonExport,
  ButtonFullscreen,
  ChartFooter,
  createChartOptions,
  createPalette,
  createTooltip,
  EChartsCard,
  timeToCategory,
} from '@/analytics/features/charts'
import { DAYS, type Period } from '@/analytics/features/charts/types'
import { llama } from '@/analytics/llamadash'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@ui-kit/shared/ui/Chart/SelectTimeOption'
import { formatUsd } from '@ui-kit/utils'
import { useCrvUsdSupply } from '../queries/useCrvUsdSupply.query'

const RESUPPLY_LAUNCH_DATE = Date.UTC(2025, 2, 20)

const SUPPLY_LABEL = t`Supply`
const DEBT_LABEL = t`Borrowed`

/** Prices API exposes keepers debt as a market with this specific string value */
const KEEPERS_DEBT_MARKET = 'Keepers debt'

const PERIODS = ['7d', '1m', '3m', '6m', '1y'] as const satisfies Period[]

/** Chart component displaying crvUSD supply over time */
export function ChartCrvUsdSupply() {
  const [period, setPeriod] = useState<Period>('6m')
  const [fullscreen, , closeFullscreen, toggleFullscreen] = useSwitch(false)

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
      llama(data)
        .groupBy((x) => new Date(x.timestamp).getTime())
        .entries()
        .map(([, x]) => ({
          time: new Date(x[0].timestamp).getTime(),
          supply: llama(x).sumBy((y) => y.supply),
          debt: x.find((y) => y.market === KEEPERS_DEBT_MARKET)?.supply ?? 0,
        }))
        .uniqWith((x, y) => x.time === y.time)
        .orderBy((c) => c.time, 'asc')
        .map((x) => ({
          time: x.time,
          supply: x.supply,
          borrowed: x.supply - x.debt,
        }))
        .value(),
    [data],
  )

  const option = useMemo(() => {
    const times = chartData.map((x) => x.time)
    const resupplyIndex = times.findLastIndex((x) => x < RESUPPLY_LAUNCH_DATE)

    return createChartOptions({
      options: {
        tooltip: createTooltip(formatUsd),
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
    <EChartsCard
      title={t`crvUSD Supply`}
      loading={loading}
      option={option}
      fullscreen={fullscreen}
      onCloseFullscreen={closeFullscreen}
      action={
        <>
          <SelectTimeOption
            ghost
            options={PERIODS}
            activeOption={period}
            setActiveOption={setPeriod}
            isLoading={loading}
          />
          <ButtonExport
            filename="crvusd_supply"
            data={{
              supply: chartData.map((x) => ({ time: x.time, value: x.supply })),
              borrowed: chartData.map((x) => ({ time: x.time, value: x.borrowed })),
            }}
          />
          <ButtonFullscreen onToggle={toggleFullscreen} />
        </>
      }
    >
      <ChartFooter
        legendSets={legendSets}
        description={t`Total crvUSD in circulation (Supply) versus the amount actively borrowed against collateral (Borrowed). The gap between the two lines reflects Pegkeeper debt — crvUSD minted by the protocol to stabilize the peg, not backed by user collateral.`}
      />
    </EChartsCard>
  )
}
