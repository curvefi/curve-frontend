import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'
import { Address } from 'viem'
import { getUtilizationPercent } from '@/llamalend/llama.utils'
import { useMarketCapAndAvailable, useRateCurve } from '@/llamalend/queries/market'
import { RateCurveTooltip } from '@/llamalend/widgets/tooltips/chart/RateCurveTooltip'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import {
  ChartFooter,
  ChartStateWrapper,
  EChartsLineChart,
  type LegendItem,
  type LineSeriesConfig,
} from '@ui-kit/shared/ui/Chart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatPercent } from '@ui-kit/utils'

const { Spacing, Height } = SizesAndSpaces

export type RateCurveChartPoint = {
  utilization: number
  borrowApr: number
  supplyApy: number
}

type RateCurveSeriesKey = keyof Omit<RateCurveChartPoint, 'utilization'>

const SERIES_CONFIG: { key: RateCurveSeriesKey; label: string; dash: string }[] = [
  { key: 'borrowApr', label: t`Borrow APR`, dash: 'none' },
  { key: 'supplyApy', label: t`Supply APY`, dash: '8 8' },
]

export const MarketRateCurveChart = ({
  market,
  blockchainId,
  chainId,
  marketId,
}: {
  market: LendMarketTemplate | undefined | null
  blockchainId: Chain | undefined
  chainId: number | undefined
  marketId: string | undefined
}) => {
  const [visibleSeries, setVisibleSeries] = useState<RateCurveSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const controllerAddress = market?.addresses.controller as Address | undefined

  const {
    design: { Color },
  } = useTheme()

  const {
    data: rateCurve,
    isLoading,
    error,
  } = useRateCurve({ blockchainId, contractAddress: controllerAddress }, Boolean(blockchainId && controllerAddress))

  const { data: capAndAvailable } = useMarketCapAndAvailable({ chainId, marketId })

  const currentUtilization = useMemo(
    () =>
      getUtilizationPercent(capAndAvailable?.available, capAndAvailable?.totalAssets) ?? rateCurve?.currentUtilization,
    [capAndAvailable, rateCurve?.currentUtilization],
  )

  const chartData = useMemo<RateCurveChartPoint[]>(
    () => sortBy(rateCurve?.rates ?? [], 'utilization'),
    [rateCurve?.rates],
  )

  const markLines = useMemo(
    () =>
      notFalsy(
        currentUtilization != null && {
          value: currentUtilization,
          label: formatPercent(currentUtilization),
          color: Color.Primary[500],
          dash: '2 2',
        },
      ),
    [currentUtilization, Color.Primary],
  )

  const seriesColors: Record<RateCurveSeriesKey, string> = useMemo(
    () => ({ borrowApr: Color.Primary[500], supplyApy: Color.Tertiary[400] }),
    [Color.Primary, Color.Tertiary],
  )

  const series: LineSeriesConfig<RateCurveSeriesKey>[] = useMemo(
    () => SERIES_CONFIG.map(serie => ({ ...serie, color: seriesColors[serie.key] })),
    [seriesColors],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries(prev => (prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries],
  )

  return (
    <Card>
      <CardHeader title={t`Interest Rate & Utilization`} size="small" />
      <CardContent component={Stack} gap={Spacing.md} size="small">
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={isLoading || !market}
          error={error}
          errorMessage={t`Unable to fetch rate curve data.`}
        >
          <EChartsLineChart<RateCurveChartPoint, RateCurveSeriesKey, 'utilization'>
            data={chartData}
            height={Height.shortChart}
            xKey="utilization"
            series={series}
            visibleSeries={visibleSeries}
            xAxisType="value"
            markLines={markLines}
            xTickFormatter={value => formatPercent(+value)}
            yTickFormatter={value => formatPercent(+value)}
            yPaddingRatio={0.05}
            renderTooltip={RateCurveTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart illustrates the relationship between utilization and interest rates in this market. It reflects the market’s monetary policy—how rates adjust based on supply and demand dynamics.`}
        />
      </CardContent>
    </Card>
  )
}
