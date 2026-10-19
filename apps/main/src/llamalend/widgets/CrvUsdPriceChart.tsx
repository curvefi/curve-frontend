import { sortBy, uniqBy } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { CrvUsdPriceTooltip } from '@/llamalend/widgets/tooltips/chart/CrvUsdPriceTooltip'
import { useCrvUsdPriceHistory } from '@evm-ui/queries/crvusd-price.query'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { type TimeOption, timeOptions } from '@evm-ui/queries/validation/time-option-validation'
import {
  addMovingAverages,
  CHART_LINE_DASH_PATTERNS,
  type ChartLineDashPattern,
  formatChartAxisNumber,
} from '@evm-ui/shared/ui/Chart/chart.utils'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { ChartSelect } from '@evm-ui/shared/ui/Chart/ChartSelect'
import { EChartsLineChart, type LineSeriesConfig } from '@evm-ui/shared/ui/Chart/EChartsLineChart'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'
import type { LegendItem } from '@evm-ui/shared/ui/Chart/LegendSet'
import { CRVUSD_ADDRESS } from '@evm-ui/utils/address'
import { AVERAGE_WINDOW_DAYS, calculateAverageRates, hasFullTimeWindow } from '@evm-ui/utils/averageRates'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@primitives/date.utils'
import { Chain } from '@primitives/network.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { TIME_OPTION_MS } from '@ui/lib/time'

const { Spacing, Height } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'

export type CrvUsdPriceChartPoint = { timestamp: number; price: number; movingAverage: number; totalAverage: number }

type PriceSeriesKey = 'price' | 'movingAverage' | 'totalAverage'
type PricePoint = { timestamp: number; price: number }

const SERIES_CONFIG: { key: PriceSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'price', label: t`crvUSD Price` },
  { key: 'movingAverage', label: t`7-day MA Price`, dash: CHART_LINE_DASH_PATTERNS.tight },
  { key: 'totalAverage', label: t`Average Price`, dash: CHART_LINE_DASH_PATTERNS.regular },
]

const averageDeviation = (priceHistory: PricePoint[], days: number, now: Date) =>
  calculateAverageRates(priceHistory, days, { deviation: ({ price }) => Math.abs(price - 1) * 100 }, now)?.deviation

const getDeviations = (priceHistory: PricePoint[], price: number, priceUpdatedAt: Date, now: Date) => {
  const pricePoints = notFalsyArray(priceHistory, [{ timestamp: priceUpdatedAt.getTime(), price }])

  return {
    week: averageDeviation(pricePoints, AVERAGE_WINDOW_DAYS.week, now),
    month: averageDeviation(pricePoints, AVERAGE_WINDOW_DAYS.month, now),
    year: averageDeviation(pricePoints, AVERAGE_WINDOW_DAYS.year, now),
    hasFullYear: hasFullTimeWindow(pricePoints, AVERAGE_WINDOW_DAYS.year, now),
  }
}

export const CrvUsdPriceChart = () => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<PriceSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const priceHistory = useCrvUsdPriceHistory({ days: AVERAGE_WINDOW_DAYS.year })
  const currentPrice = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: CRVUSD_ADDRESS })
  const dataUpdatedAt = useMemo(
    () => new Date(Math.max(priceHistory.dataUpdatedAt, currentPrice.dataUpdatedAt)),
    [priceHistory.dataUpdatedAt, currentPrice.dataUpdatedAt],
  )
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
    const cutoff = new Date(priceHistory.dataUpdatedAt - TIME_OPTION_MS[timeOption])
    return addMovingAverages(
      pricePoints.filter(({ timestamp }) => timestamp >= cutoff.getTime()),
      d => d.price,
      d => d.timestamp,
    )
  }, [pricePoints, priceHistory.dataUpdatedAt, timeOption])

  const deviations = useCombinedQueries(
    [priceHistory, currentPrice],
    useCallback(
      (priceHistory, price) => getDeviations(priceHistory, price, new Date(currentPrice.dataUpdatedAt), dataUpdatedAt),
      [currentPrice.dataUpdatedAt, dataUpdatedAt],
    ),
  )
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
          <ChartSelect
            uppercase
            options={timeOptions}
            activeOption={timeOption}
            setActiveOption={setTimeOption}
            isLoading={showLoading}
          />
        }
      />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <MetricsGrid>
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
        </MetricsGrid>
        <EvmChartStateWrapper
          height={Height.chart.sm}
          isLoading={showLoading}
          error={priceHistory.error}
          errorMessage={t`Unable to fetch historical crvUSD peg data.`}
        >
          <EChartsLineChart<CrvUsdPriceChartPoint, PriceSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.chart.sm}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: CrvUsdPriceChartPoint['timestamp'] | string) => formatDate(value)}
            yTickFormatter={value => formatChartAxisNumber(+value, { unit: 'dollar' })}
            yPaddingRatio={0.25}
            renderTooltip={CrvUsdPriceTooltip}
          />
        </EvmChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart shows crvUSD's historical peg to $1. For mint market interest rates, the rate is a function of crvUSD's peg. When the price dips below $1, rates increase to incentivize loan repayment and reduce supply; when the price rises above $1, rates decrease to encourage borrowing — restoring balance to the system.`}
        />
      </CardContent>
    </Card>
  )
}
