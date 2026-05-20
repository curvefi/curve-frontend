import { sortBy, uniqBy } from 'lodash'
import { useMemo, useState } from 'react'
import { useCrvUsdTotalSupply } from '@/llamalend/queries/crvusd-total-supply.query'
import { CrvUsdPriceTooltip } from '@/llamalend/widgets/tooltips/chart/CrvUsdPriceTooltip'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { notFalsyArray } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { useCrvUsdPriceHistory } from '@ui-kit/entities/crvusd-price.query'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { timeOptions, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_FRAMES, TIME_OPTION_MS } from '@ui-kit/lib/model/time'
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
import { Chain, CRVUSD_ADDRESS } from '@ui-kit/utils'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

const { Spacing, Height } = SizesAndSpaces

export type CrvUsdPriceChartPoint = {
  timestamp: number
  price: number
  movingAverage: number
  totalAverage: number
}

type PriceSeriesKey = 'price' | 'movingAverage' | 'totalAverage'

const SERIES_CONFIG: { key: PriceSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'price', label: t`crvUSD Price` },
  { key: 'movingAverage', label: t`7-day MA Price`, dash: CHART_LINE_DASH_PATTERNS.tight },
  { key: 'totalAverage', label: t`Average Price`, dash: CHART_LINE_DASH_PATTERNS.regular },
]

export const CrvUsdPriceChart = () => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<PriceSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const days = Math.round(TIME_OPTION_MS[timeOption] / TIME_FRAMES.DAY_MS)

  const { data: priceHistory = [], isLoading, isPlaceholderData, error } = useCrvUsdPriceHistory({ days })
  const { data: currentPrice, isLoading: isCurrentPriceLoading } = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useCrvUsdTotalSupply({})
  // keepPreviousData is enabled on this query for analytics, so isLoading stays false when switching time options.
  // Check isPlaceholderData to show the loader while fresh data is being fetched.
  const showLoading = isLoading || isPlaceholderData

  const chartData = useMemo<CrvUsdPriceChartPoint[]>(() => {
    const sorted = sortBy(
      uniqBy(
        priceHistory.map(item => ({ timestamp: new Date(item.timestamp).getTime(), price: item.price })),
        'timestamp',
      ),
      item => item.timestamp,
    )

    return addMovingAverages(
      sorted,
      d => d.price,
      d => d.timestamp,
    )
  }, [priceHistory])

  const oneWeekDeviation = useMemo(() => {
    const now = Date.now()

    return (
      calculateAverageRates(
        notFalsyArray(priceHistory, currentPrice != null && [{ timestamp: now, price: currentPrice }]),
        7,
        { deviation: ({ price }) => Math.abs(price - 1) * 100 },
      )?.deviation ?? null
    )
  }, [currentPrice, priceHistory])

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
    <Card size="small">
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
      <CardContent component={Stack} gap={Spacing.md}>
        <Stack
          display="grid"
          gap={Spacing.xl}
          gridTemplateColumns={{ mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)' }}
        >
          <Metric
            size="medium"
            label={t`Current price`}
            value={currentPrice}
            loading={currentPrice == null && isCurrentPriceLoading}
            valueOptions={{ unit: 'dollar', maximumSignificantDigits: 5 }}
          />
          <Metric
            size="medium"
            label={t`1W deviation`}
            value={oneWeekDeviation}
            loading={oneWeekDeviation == null && (showLoading || isCurrentPriceLoading)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            size="medium"
            label={t`Total supply`}
            value={totalSupply}
            loading={totalSupply == null && isTotalSupplyLoading}
            valueOptions={{ unit: 'dollar' }}
          />
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={showLoading}
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
