import type { EChartsOption } from 'echarts'
import { useMemo } from 'react'
import { useTheme, type Theme } from '@mui/material/styles'
import { toArray } from '@primitives/array.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { buildContinuousOption, buildRangeMarkAreas, buildSplitOption } from './small-liquidation-range-chart.options'
import type {
  ChartColors,
  ChartTextStyle,
  LiquidationRange,
  RenderableLiquidationRange,
  SmallLiquidationRangeChartLayout,
  SmallLiquidationRangeChartProps,
  SplitLayout,
} from './small-liquidation-range-chart.types'
import { getSmallLiquidationRangeChartLayout, toEChartsPixelValue } from './small-liquidation-range-chart.utils'

const { FontSize, FontWeight, LineHeight } = SizesAndSpaces

const isSplitLayout = (layout?: SmallLiquidationRangeChartLayout): layout is SplitLayout =>
  layout?.mode === 'split-left' || layout?.mode === 'split-right'

const toRenderableRange = (range?: LiquidationRange): RenderableLiquidationRange | undefined =>
  range && [Number(range[0]), Number(range[1])]

const getBodyXsRegularChartTextStyle = (theme: Theme): ChartTextStyle => ({
  fontFamily: theme.typography.bodyXsRegular.fontFamily as string,
  fontSize: toEChartsPixelValue(FontSize.xs.desktop, theme.typography.htmlFontSize),
  fontWeight: Number(theme.typography.bodyXsRegular.fontWeight) || FontWeight.Medium,
  lineHeight: toEChartsPixelValue(LineHeight.xs.desktop, theme.typography.htmlFontSize),
})

const getChartColors = ({ design: { Chart, Color, Text } }: Theme): ChartColors => ({
  axisLabel: Text.TextColors.Tertiary,
  axisLine: Color.Neutral[600],
  referenceLine: Color.Primary[500],
  oracleMarkerLabel: Text.TextColors.Highlight,
  oracleMarkerLabelBackground: Color.Neutral[50],
  rangeLabel: Text.TextColors.Primary,
  currentRange: Chart.LiquidationZone.Current,
  newRangeLine: Chart.LiquidationZone.FutureLine,
})

const getRenderableRanges = ({ currentRange, newRange }: SmallLiquidationRangeChartProps['liquidationRanges']) => ({
  currentRange: toRenderableRange(currentRange),
  newRange: toRenderableRange(newRange),
})

const getSeriesData = ({
  currentRange,
  newRange,
  oraclePrice,
}: {
  currentRange?: RenderableLiquidationRange
  newRange?: RenderableLiquidationRange
  oraclePrice?: number
}) => notFalsyArray(currentRange, newRange, toArray(oraclePrice)).map(value => [value, 0])

export const useSmallLiquidationRangeChartOption = ({
  liquidationRanges,
  oraclePrice,
}: SmallLiquidationRangeChartProps): EChartsOption => {
  const { newRange, currentRange } = liquidationRanges
  const theme = useTheme()
  const colors = useMemo(() => getChartColors(theme), [theme])
  const chartTextStyle = useMemo(() => getBodyXsRegularChartTextStyle(theme), [theme])
  const { currentRange: renderableCurrentRange, newRange: renderableNewRange } = useMemo(
    () => getRenderableRanges({ currentRange, newRange }),
    [currentRange, newRange],
  )
  const renderableOraclePrice = oraclePrice == null ? undefined : Number(oraclePrice)
  const chartLayout = useMemo(
    () =>
      getSmallLiquidationRangeChartLayout({
        currentRange: renderableCurrentRange,
        newRange: renderableNewRange,
        oraclePrice: renderableOraclePrice,
      }),
    [renderableCurrentRange, renderableNewRange, renderableOraclePrice],
  )

  const hasChartData = !!renderableCurrentRange || !!renderableNewRange || renderableOraclePrice !== undefined
  const formattedOraclePrice = formatNumber(oraclePrice, { abbreviate: false }) ?? ''
  const seriesData = useMemo(
    () =>
      getSeriesData({
        currentRange: renderableCurrentRange,
        newRange: renderableNewRange,
        // In split mode the oracle is rendered on the synthetic rail, so keep the
        // real oracle value off the main range axis.
        oraclePrice: chartLayout?.mode === 'continuous' ? renderableOraclePrice : undefined,
      }),
    [chartLayout?.mode, renderableCurrentRange, renderableNewRange, renderableOraclePrice],
  )
  const rangeMarkAreas = useMemo(
    () =>
      buildRangeMarkAreas({
        colors,
        currentRange: renderableCurrentRange,
        hasNewRange: !!renderableNewRange,
        newRange: renderableNewRange,
        textStyle: chartTextStyle,
      }),
    [chartTextStyle, colors, renderableCurrentRange, renderableNewRange],
  )
  const optionContext = useMemo(
    () => ({
      chartTextStyle,
      colors,
      formattedOraclePrice,
      hasChartData,
      htmlFontSize: theme.typography.htmlFontSize,
      oraclePrice: renderableOraclePrice,
      rangeMarkAreas,
      seriesData,
    }),
    [
      chartTextStyle,
      colors,
      formattedOraclePrice,
      hasChartData,
      rangeMarkAreas,
      renderableOraclePrice,
      seriesData,
      theme.typography.htmlFontSize,
    ],
  )

  return useMemo(
    () =>
      isSplitLayout(chartLayout)
        ? buildSplitOption({ ...optionContext, chartLayout })
        : buildContinuousOption({ ...optionContext, chartLayout }),
    [chartLayout, optionContext],
  )
}
