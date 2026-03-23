import { type MouseEvent, useMemo, useState } from 'react'
import { type LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { HistoricalRatesTooltip } from '@/llamalend/widgets/tooltips/chart/HistoricalRatesTooltip'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
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
  SelectTimeOption,
} from '@ui-kit/shared/ui/Chart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing, Height } = SizesAndSpaces

type RateMode = 'borrow' | 'supply'

export type RateChartPoint = {
  timestamp: number
  rate: number
  rate7dAvg: number
  rateTotalAvg: number
}

type RateSeriesKey = 'rate' | 'rate7dAvg' | 'rateTotalAvg'

type MarketHistoricalRatesChartProps = {
  market: LlamaMarketTemplate | undefined | null
  blockchainId: Chain | undefined
}

const BORROW_SERIES_CONFIG: { key: RateSeriesKey; label: string; dash: string }[] = [
  { key: 'rate', label: t`Borrow APR`, dash: 'none' },
  { key: 'rate7dAvg', label: t`7-day MA APR`, dash: '2 2' },
  { key: 'rateTotalAvg', label: t`Average APR`, dash: '4 4' },
]

const SUPPLY_SERIES_CONFIG: { key: RateSeriesKey; label: string; dash: string }[] = [
  { key: 'rate', label: t`Supply APY`, dash: 'none' },
  { key: 'rate7dAvg', label: t`7-day MA APY`, dash: '2 2' },
  { key: 'rateTotalAvg', label: t`Average APY`, dash: '4 4' },
]

export const MarketHistoricalRatesChart = ({ market, blockchainId }: MarketHistoricalRatesChartProps) => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [rateMode, setRateMode] = useState<RateMode>('borrow')
  const [visibleSeries, setVisibleSeries] = useState<RateSeriesKey[]>(BORROW_SERIES_CONFIG.map(({ key }) => key))
  const isLendMarket = market instanceof LendMarketTemplate
  const {
    design: { Color },
  } = useTheme()

  const {
    data: snapshots = [],
    isLoading,
    error,
  } = useLlamaSnapshot(market, blockchainId, Boolean(market && blockchainId), { kind: 'timeRange', timeOption })

  const activeSeriesConfig = rateMode === 'borrow' ? BORROW_SERIES_CONFIG : SUPPLY_SERIES_CONFIG

  const chartData = useMemo<RateChartPoint[]>(() => {
    const sorted = snapshots
      .map((snapshot) => ({
        timestamp: snapshot.timestamp.getTime(),
        rate: Number(rateMode === 'borrow' ? snapshot.borrowApr : 'lendApy' in snapshot ? snapshot.lendApy : 0),
      }))
      .filter((item) => Number.isFinite(item.timestamp) && Number.isFinite(item.rate))
      .sort((a, b) => a.timestamp - b.timestamp)

    return addMovingAverages(
      sorted,
      (d) => d.rate,
      (d) => d.timestamp,
    ).map(({ movingAverage, totalAverage, ...rest }) => ({
      ...rest,
      rate7dAvg: movingAverage,
      rateTotalAvg: totalAverage,
    }))
  }, [snapshots, rateMode])

  const seriesColors: Record<RateSeriesKey, string> = useMemo(
    () => ({
      rate: Color.Primary[500],
      rate7dAvg: Color.Secondary[500],
      rateTotalAvg: Color.Tertiary[400],
    }),
    [Color.Primary, Color.Secondary, Color.Tertiary],
  )

  const series: LineSeriesConfig<RateSeriesKey>[] = useMemo(
    () =>
      activeSeriesConfig.map(({ key, label, dash }) => ({
        key,
        label,
        color: seriesColors[key],
        dash,
      })),
    [seriesColors, activeSeriesConfig],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      activeSeriesConfig.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries, activeSeriesConfig],
  )

  const handleRateModeChange = (_: MouseEvent<HTMLElement>, mode: RateMode | null) => {
    if (mode) setRateMode(mode)
  }

  return (
    <Card>
      <CardHeader
        title={rateMode === 'borrow' ? t`Historical Borrow Rate` : t`Historical Supply Rate`}
        size="small"
        action={
          <Stack direction="row" gap={Spacing.xs} alignItems="center">
            {isLendMarket && (
              <ToggleButtonGroup exclusive value={rateMode} onChange={handleRateModeChange}>
                <ToggleButton value="borrow" size="extraSmall">
                  {t`Borrow`}
                </ToggleButton>
                <ToggleButton value="supply" size="extraSmall">
                  {t`Supply`}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <SelectTimeOption
              options={timeOptions}
              activeOption={timeOption}
              setActiveOption={setTimeOption}
              isLoading={isLoading || !market}
            />
          </Stack>
        }
      />
      <Stack gap={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={isLoading || !market}
          error={error}
          errorMessage={t`Unable to fetch historical rates data.`}
        >
          <EChartsLineChart<RateChartPoint, RateSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.shortChart}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: RateChartPoint['timestamp'] | number | string) => formatDate(value)}
            yTickFormatter={(value) => formatNumber(+value, { unit: 'percentage', abbreviate: false, decimals: 2 })}
            yPaddingRatio={0.05}
            renderTooltip={HistoricalRatesTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter legendSets={legendSets} />
      </Stack>
    </Card>
  )
}
