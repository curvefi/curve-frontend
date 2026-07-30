import { sortBy, uniqBy } from 'lodash'
import { useMemo, useState } from 'react'
import { CrvUsdPriceTooltip } from '@/llamalend/widgets/tooltips/chart/CrvUsdPriceTooltip'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { notFalsyArray } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { useCrvUsdPriceHistory } from '@ui-kit/entities/crvusd-price.query'
import { useCombinedQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { timeOptions, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import {
  ChartStateWrapper,
  ChartFooter,
  type LegendItem,
  addMovingAverages,
  CHART_LINE_DASH_PATTERNS,
  EChartsLineChart,
  formatChartAxisNumber,
  type ChartLineDashPattern,
  type LineSeriesConfig,
  SelectTimeOption,
} from '@ui-kit/shared/ui/Chart'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q } from '@ui-kit/types/util'
import { Chain, CRVUSD_ADDRESS } from '@ui-kit/utils'
import { AVERAGE_WINDOW_DAYS, calculateAverageRates, hasFullTimeWindow } from '@ui-kit/utils/averageRates'

const { Spacing, Height } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'

export type CrvUsdPriceChartPoint = {
  timestamp: number
  price: number
  movingAverage: number
  totalAverage: number
}

type PriceSeriesKey = 'price' | 'movingAverage' | 'totalAverage'
type PricePoint = { timestamp: number; price: number }

const SERIES_CONFIG: { key: PriceSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'price', label: t`crvUSD Price` },
  { key: 'movingAverage', label: t`7-day MA Price`, dash: CHART_LINE_DASH_PATTERNS.tight },
  { key: 'totalAverage', label: t`Average Price`, dash: CHART_LINE_DASH_PATTERNS.regular },
]

const averageDeviation = (priceHistory: PricePoint[], days: number) =>
  calculateAverageRates(priceHistory, days, {
    deviation: ({ price }) => Math.abs(price - 1) * 100,
  })?.deviation

const getDeviations = (priceHistory: PricePoint[], price: number, timestamp = Date.now()) => {
  const pricePoints = notFalsyArray(priceHistory, [{ timestamp, price }])

  return {
    week: averageDeviation(pricePoints, AVERAGE_WINDOW_DAYS.week),
    month: averageDeviation(pricePoints, AVERAGE_WINDOW_DAYS.month),
    year: averageDeviation(pricePoints, AVERAGE_WINDOW_DAYS.year),
    hasFullYear: hasFullTimeWindow(pricePoints, AVERAGE_WINDOW_DAYS.year, timestamp),
  }
}

export const CrvUsdPriceChart = () => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<PriceSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const priceHistory = useCrvUsdPriceHistory({ days: AVERAGE_WINDOW_DAYS.year })
  const currentPrice = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const showLoading = priceHistory.isLoading || priceHistory.isPlaceholderData

  const pricePoints = useMemo(
    () =>
      sortBy(
        uniqBy(
          (priceHistory.data ?? []).map(item => ({ timestamp: new Date(item.timestamp).getTime(), price: item.price })),
          'timestamp',
        ),
        item => item.timestamp,
      ),
    [priceHistory.data],
  )

  const chartData = useMemo<CrvUsdPriceChartPoint[]>(() => {
    const cutoff = Date.now() - TIME_OPTION_MS[timeOption]
    return addMovingAverages(
      pricePoints.filter(({ timestamp }) => timestamp >= cutoff),
      d => d.price,
      d => d.timestamp,
    )
  }, [pricePoints, timeOption])

  const deviations = useCombinedQueries([priceHistory, currentPrice], getDeviations)
  const showOneYearDeviation = deviations.isLoading || deviations.data?.hasFullYear

  const seriesColors: Record<PriceSeriesKey, string> = useMemo(
    () => ({ price: Color.Primary[500], movingAverage: Color.Secondary[500], totalAverage: Color.Tertiary[400] }),
    [Color.Primary, Color.Secondary, Color.Tertiary],
  )

  const series: LineSeriesConfig<PriceSeriesKey>[] = useMemo(
    () => SERIES_CONFIG.map(({ key, label, dash }) => ({ key, label, color: seriesColors[key], dash })),
    [seriesColors],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () => setVisibleSeries(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries],
  )

  return (
    <Card size="small" data-testid="crvusd-price-chart">
      <CardHeader
        title={t`Historical crvUSD Peg`}
        action={
          <SelectTimeOption
            options={timeOptions}
            activeOption={timeOption}
            setActiveOption={setTimeOption}
            isLoading={showLoading}
          />
        }
      />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <Stack
          sx={{
            display: 'grid',
            gap: Spacing.xl,
            gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(5, 1fr)' },
          }}
        >
          <Metric
            category={METRIC_CATEGORY}
            label={t`Current price`}
            value={q(currentPrice)}
            valueOptions={{ unit: 'dollar', maximumSignificantDigits: 5 }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`1W deviation`}
            value={mapQuery(deviations, ({ week }) => week)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`1M deviation`}
            value={mapQuery(deviations, ({ month }) => month)}
            valueOptions={{ unit: 'percentage' }}
          />
          {showOneYearDeviation && (
            <Metric
              category={METRIC_CATEGORY}
              label={t`1Y deviation`}
              value={mapQuery(deviations, ({ year }) => year)}
              valueOptions={{ unit: 'percentage' }}
            />
          )}
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={showLoading}
          error={priceHistory.error}
          errorMessage={t`Unable to fetch historical crvUSD peg data.`}
        >
          <EChartsLineChart<CrvUsdPriceChartPoint, PriceSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.shortChart}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: CrvUsdPriceChartPoint['timestamp'] | string) => formatDate(value)}
            yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'dollar' })}
            yPaddingRatio={0.25}
            renderTooltip={CrvUsdPriceTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart shows crvUSD's historical peg to $1. For mint market interest rates, the rate is a function of crvUSD's peg. When the price dips below $1, rates increase to incentivize loan repayment and reduce supply; when the price rises above $1, rates decrease to encourage borrowing — restoring balance to the system.`}
        />
      </CardContent>
    </Card>
  )
}
