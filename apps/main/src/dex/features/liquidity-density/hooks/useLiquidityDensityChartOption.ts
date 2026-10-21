import type { EChartsOption } from 'echarts'
import { useMemo } from 'react'
import { CHART_LINE_WIDTHS, formatChartAxisNumber } from '@evm-ui/shared/ui/Chart/chart.utils'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import type { LiquidityProfile } from '@ui/features/pools/liquidity-density/types'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useBreakpoint } from '@ui/hooks/useBreakpoints'
import type { LiquidityPriceMarker } from '../LiquidityDensityChart'

const { FontSize, LineHeight, Spacing, BorderWidth } = SizesAndSpaces

export const useLiquidityDensityChartOption = ({
  profile: { data: profile },
  markers,
  liquidityLabel,
  tooltipFormatter,
}: {
  profile: QueryProp<LiquidityProfile>
  markers: LiquidityPriceMarker[]
  liquidityLabel: string
  tooltipFormatter: (params: unknown) => HTMLElement | string
}): EChartsOption => {
  const theme = useTheme()
  const breakpoint = useBreakpoint()
  return useMemo(() => {
    const {
      design: { Chart, Color, Text },
      typography: {
        bodyXsRegular: { fontFamily },
        htmlFontSize,
      },
    } = theme
    const px = (value: `${number}rem`) => Number.parseFloat(value) * htmlFontSize
    const textStyle = {
      fontFamily: fontFamily as string,
      fontSize: px(FontSize.xs[breakpoint]),
      lineHeight: px(LineHeight.xs[breakpoint]),
      color: Text.TextColors.Tertiary,
    }
    const gridLine = { color: Color.Neutral[200], width: px(BorderWidth.thin) }
    const { samples = [], low = 0, high = 1, spot = 0 } = profile ?? {}

    return {
      animation: false,
      textStyle,
      grid: {
        left: 0,
        right: px(Spacing.xs[breakpoint]),
        top: px(Spacing.sm[breakpoint]),
        bottom: px(Spacing.xs[breakpoint]),
        outerBoundsMode: 'same',
        outerBoundsContain: 'all',
      },
      xAxis: {
        type: 'value',
        min: low,
        max: high,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: gridLine },
        axisLabel: {
          ...textStyle,
          hideOverlap: true,
          showMinLabel: false,
          showMaxLabel: false,
          formatter: (value: number) => formatChartAxisNumber(value, { unit: 'dollar' }),
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        name: liquidityLabel,
        nameLocation: 'middle',
        nameGap: px(Spacing.sm[breakpoint]),
        nameMoveOverlap: true,
        nameTextStyle: { ...textStyle, color: Text.TextColors.Secondary },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: gridLine },
        axisLabel: { ...textStyle, formatter: (value: number) => formatChartAxisNumber(value, { unit: 'dollar' }) },
      },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: {
          type: 'line',
          lineStyle: { color: Text.TextColors.Tertiary, width: CHART_LINE_WIDTHS.defaultPriceLine },
        },
        formatter: tooltipFormatter,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      },
      series: [
        {
          type: 'custom',
          // Numeric interval edges preserve the logarithmic sampling widths and solver gaps on a linear price axis.
          dimensions: ['price', 'depth', 'low', 'high'],
          encode: { x: [0, 2, 3], y: 1, tooltip: [0, 1] },
          data: samples.map(({ price, depth, low, high }) => [price, depth, low, high]),
          clip: true,
          renderItem: (_params, api) => {
            const low = Number(api.value(2))
            const high = Number(api.value(3))
            const depth = Number(api.value(1))
            const [left, top] = api.coord([low, depth])
            const [right, bottom] = api.coord([high, 0])
            const [split] = api.coord([Math.max(low, Math.min(high, spot)), 0])
            const gap = Math.min(px(BorderWidth.thin), (right - left) / 4)
            // A bin containing spot is split at the actual price, so token colors meet at the current-price line.
            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: { x: left + gap / 2, y: top, width: Math.max(0, split - left - gap), height: bottom - top },
                  style: { fill: Chart.Lines[7] },
                },
                {
                  type: 'rect',
                  shape: { x: split + gap / 2, y: top, width: Math.max(0, right - split - gap), height: bottom - top },
                  style: { fill: Chart.Lines[8] },
                },
              ],
            }
          },
          markLine: {
            precision: -1, // Preserve price precision; ECharts otherwise rounds coordinates to two decimals.
            silent: true,
            symbol: ['none', 'none'],
            label: { show: false },
            data: notFalsy(
              ...markers.map(
                ({ value: { data: value }, color, dash }) =>
                  value != null &&
                  value >= low &&
                  value <= high && {
                    xAxis: value,
                    lineStyle: { color, width: CHART_LINE_WIDTHS.referenceLine, type: dash },
                  },
              ),
            ),
          },
        },
      ],
    }
  }, [liquidityLabel, markers, profile, theme, tooltipFormatter, breakpoint])
}
