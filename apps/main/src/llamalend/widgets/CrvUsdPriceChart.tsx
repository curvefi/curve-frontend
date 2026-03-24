import { useMemo, useState } from 'react'
import { CrvUsdPriceTooltip } from '@/llamalend/widgets/tooltips/chart/CrvUsdPriceTooltip'
import { Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { useCrvUsdPriceHistory } from '@ui-kit/entities/crvusd-price.query'
import { t } from '@ui-kit/lib/i18n'
import { timeOptions, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_FRAMES, TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import {
  ChartStateWrapper,
  ChartFooter,
  type LegendItem,
  addMovingAverages,
  EChartsLineChart,
  type LineSeriesConfig,
  SelectTimeOption,
} from '@ui-kit/shared/ui/Chart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing, Height } = SizesAndSpaces

export type CrvUsdPriceChartPoint = {
  timestamp: number
  price: number
  movingAverage: number
  totalAverage: number
}

type PriceSeriesKey = 'price' | 'movingAverage' | 'totalAverage'

const SERIES_CONFIG: { key: PriceSeriesKey; label: string; dash: string }[] = [
  { key: 'price', label: t`crvUSD Price`, dash: 'none' },
  { key: 'movingAverage', label: t`7-day MA Price`, dash: '2 2' },
  { key: 'totalAverage', label: t`Average Price`, dash: '4 4' },
]

export const CrvUsdPriceChart = () => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<PriceSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const days = Math.round(TIME_OPTION_MS[timeOption] / TIME_FRAMES.DAY_MS)

  const { data: priceHistory = [], isLoading, error } = useCrvUsdPriceHistory({ days })

  const chartData = useMemo<CrvUsdPriceChartPoint[]>(() => {
    const seen = new Set<number>()
    const sorted = priceHistory
      .map((item) => ({
        timestamp: new Date(item.timestamp).getTime(),
        price: item.price,
      }))
      .filter((item) => {
        if (!Number.isFinite(item.timestamp) || !Number.isFinite(item.price)) return false
        if (seen.has(item.timestamp)) return false
        seen.add(item.timestamp)
        return true
      })
      .sort((a, b) => a.timestamp - b.timestamp)

    return addMovingAverages(
      sorted,
      (d) => d.price,
      (d) => d.timestamp,
    )
  }, [priceHistory])

  const seriesColors: Record<PriceSeriesKey, string> = useMemo(
    () => ({
      price: Color.Primary[500],
      movingAverage: Color.Secondary[500],
      totalAverage: Color.Tertiary[400],
    }),
    [Color.Primary, Color.Secondary, Color.Tertiary],
  )

  const series: LineSeriesConfig<PriceSeriesKey>[] = useMemo(
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

  return (
    <Card>
      <CardHeader
        title={t`Historical crvUSD Peg`}
        size="small"
        action={
          <SelectTimeOption
            options={timeOptions}
            activeOption={timeOption}
            setActiveOption={setTimeOption}
            isLoading={isLoading}
          />
        }
      />
      <Stack gap={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={isLoading}
          error={error}
          errorMessage={t`Unable to fetch historical crvUSD peg data.`}
        >
          <EChartsLineChart<CrvUsdPriceChartPoint, PriceSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.shortChart}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: CrvUsdPriceChartPoint['timestamp'] | number | string) => formatDate(value)}
            yTickFormatter={(value) =>
              formatNumber(+value, { unit: 'dollar', abbreviate: false, decimals: 4, minimumFractionDigits: 4 })
            }
            yPaddingRatio={0.05}
            renderTooltip={CrvUsdPriceTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart shows crvUSD's historical peg to $1. For mint market interest rates, the rate is a function of crvUSD's peg. When the price dips below $1, rates increase to incentivize loan repayment and reduce supply; when the price rises above $1, rates decrease to encourage borrowing — restoring balance to the system.`}
        />
      </Stack>
    </Card>
  )
}
