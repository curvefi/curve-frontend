import { type MouseEvent, useMemo, useState } from 'react'
import { type LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { HistoricalRatesTooltip } from '@/llamalend/widgets/tooltips/chart/HistoricalRatesTooltip'
import type { Chain } from '@curvefi/prices-api'
import { Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { timeOptions, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import {
  ChartStateWrapper,
  ChartFooter,
  type LegendItem,
  addMovingAverages,
  EChartsLineChart,
  type LineSeriesConfig,
} from '@ui-kit/shared/ui/Chart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export type BorrowAprChartPoint = {
  timestamp: number
  borrowApr: number
  borrowApr7dAvg: number
  borrowAprTotalAvg: number
}

type BorrowAprSeriesKey = 'borrowApr' | 'borrowApr7dAvg' | 'borrowAprTotalAvg'

type MarketHistoricalRatesChartProps = {
  market: LlamaMarketTemplate | undefined | null
  blockchainId: Chain | undefined
}

const SERIES_CONFIG: { key: BorrowAprSeriesKey; label: string; dash: string }[] = [
  { key: 'borrowApr', label: t`Borrow APR`, dash: 'none' },
  { key: 'borrowApr7dAvg', label: t`7-day MA APR`, dash: '2 2' },
  { key: 'borrowAprTotalAvg', label: t`Average APR`, dash: '4 4' },
]

const ChartHeight = 172

export const MarketHistoricalRatesChart = ({ market, blockchainId }: MarketHistoricalRatesChartProps) => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<BorrowAprSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const {
    data: snapshots = [],
    isLoading,
    error,
  } = useLlamaSnapshot(market, blockchainId, Boolean(market && blockchainId), { kind: 'timeRange', timeOption })

  const chartData = useMemo<BorrowAprChartPoint[]>(() => {
    const sorted = snapshots
      .map((snapshot) => ({
        timestamp: snapshot.timestamp.getTime(),
        borrowApr: Number(snapshot.borrowApr),
      }))
      .filter((item) => Number.isFinite(item.timestamp) && Number.isFinite(item.borrowApr))
      .sort((a, b) => a.timestamp - b.timestamp)

    return addMovingAverages(
      sorted,
      (d) => d.borrowApr,
      (d) => d.timestamp,
    ).map(({ movingAverage, totalAverage, ...rest }) => ({
      ...rest,
      borrowApr7dAvg: movingAverage,
      borrowAprTotalAvg: totalAverage,
    }))
  }, [snapshots])

  const seriesColors: Record<BorrowAprSeriesKey, string> = useMemo(
    () => ({
      borrowApr: Color.Primary[500],
      borrowApr7dAvg: Color.Secondary[500],
      borrowAprTotalAvg: Color.Tertiary[400],
    }),
    [Color.Primary, Color.Secondary, Color.Tertiary],
  )

  const series: LineSeriesConfig<BorrowAprSeriesKey>[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, dash }) => ({
        key,
        label,
        color: seriesColors[key],
        dash,
      })),
    [seriesColors],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries],
  )

  const handleToggleChange = (_: MouseEvent<HTMLElement>, option: TimeOption | null) => {
    if (option) setTimeOption(option) // MUI passes null when button is already selected and we don't want to allow a state where nothing is selected
  }

  return (
    <Card>
      <CardHeader title={t`Historical Interest Rate`} size="small" />
      <Stack gap={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
        <ChartStateWrapper
          height={ChartHeight}
          isLoading={isLoading || !market}
          error={error}
          errorMessage={t`Unable to fetch historical rates data.`}
        >
          <EChartsLineChart<BorrowAprChartPoint, BorrowAprSeriesKey, 'timestamp'>
            data={chartData}
            height={ChartHeight}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: BorrowAprChartPoint['timestamp'] | number | string) => formatDate(value)}
            yTickFormatter={(value) => formatNumber(+value, { unit: 'percentage', abbreviate: false, decimals: 1 })}
            yPaddingRatio={0.05}
            renderTooltip={HistoricalRatesTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          toggleOptions={timeOptions}
          activeToggleOption={timeOption}
          onToggleChange={handleToggleChange}
        />
      </Stack>
    </Card>
  )
}
