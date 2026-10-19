import type { EChartsOption } from 'echarts'
import { useMemo } from 'react'
import { CHART_LINE_WIDTHS, formatChartAxisNumber } from '@evm-ui/shared/ui/Chart/chart.utils'
import { useTheme } from '@mui/material/styles'
import type { Unit } from '@primitives/units.util'
import type { LiquidityProfile } from '@ui/features/pools/liquidity-density/types'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { LiquidityPriceMarker } from '../LiquidityDensityChart'

const { FontSize, LineHeight, Spacing, BorderWidth } = SizesAndSpaces

export const useLiquidityDensityChartOption = ({
  profile,
  markers,
  priceLabel,
  liquidityLabel,
  unit,
  tooltipFormatter,
}: {
  profile?: LiquidityProfile
  markers: LiquidityPriceMarker[]
  priceLabel: string
  liquidityLabel: string
  unit: Unit
  tooltipFormatter: (params: unknown) => HTMLElement | string
}): EChartsOption => {
  const theme = useTheme()
  return useMemo(() => {
    const {
      palette,
      design: { Chart, Color, Text },
      typography: { bodyXsRegular, htmlFontSize },
    } = theme
    const px = (value: `${number}rem`) => Number.parseFloat(value) * htmlFontSize
    const textStyle = {
      fontFamily: bodyXsRegular.fontFamily as string,
      fontSize: px(FontSize.xs.desktop),
      lineHeight: px(LineHeight.xs.desktop),
      color: Text.TextColors.Tertiary,
    }
    const gridLine = { color: Color.Neutral[200], width: px(BorderWidth.thin) }
    const { samples, low = 0, high = 1, spot = 0 } = profile ?? {}

    return {
      animation: false,
      textStyle,
      grid: {
        left: 0,
        right: px(Spacing.xs.desktop),
        top: px(Spacing.sm.desktop),
        bottom: px(Spacing.xs.desktop),
        outerBoundsMode: 'same',
        outerBoundsContain: 'all',
      },
      xAxis: {
        type: 'value',
        min: low,
        max: high,
        name: priceLabel,
        nameLocation: 'middle',
        nameGap: px(Spacing.sm.desktop),
        nameMoveOverlap: true,
        nameTextStyle: { ...textStyle, color: Text.TextColors.Secondary },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: true, lineStyle: gridLine },
        axisLabel: {
          ...textStyle,
          hideOverlap: true,
          showMinLabel: false,
          showMaxLabel: false,
          formatter: (value: number) => formatChartAxisNumber(value),
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        name: liquidityLabel,
        nameLocation: 'middle',
        nameGap: px(Spacing.sm.desktop),
        nameMoveOverlap: true,
        nameTextStyle: { ...textStyle, color: Text.TextColors.Secondary },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: gridLine },
        axisLabel: { ...textStyle, formatter: (value: number) => formatChartAxisNumber(value, { unit }) },
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
          data: samples?.map(({ price, depth, low, high }) => [price, depth, low, high]) ?? [],
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
                  style: { fill: Chart.Lines[1] },
                },
                {
                  type: 'rect',
                  shape: { x: split + gap / 2, y: top, width: Math.max(0, right - split - gap), height: bottom - top },
                  style: { fill: Chart.Lines[2] },
                },
              ],
            }
          },
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: markers
              .filter(({ value }) => value >= low && value <= high)
              .map(({ value, color, dash, showPrice }) => ({
                xAxis: value,
                lineStyle: { color, width: CHART_LINE_WIDTHS.referenceLine, type: dash ?? 'solid' },
                label: {
                  show: !!showPrice,
                  formatter: formatChartAxisNumber(value, {
                    abbreviateFrom: false,
                    useGrouping: true,
                    significantDigits: 8,
                  }),
                  position: 'start',
                  ...textStyle,
                  color: palette.getContrastText(color),
                  backgroundColor: color,
                  padding: [px(Spacing['3xs'].desktop), px(Spacing.xxs.desktop)],
                  distance: 0,
                },
              })),
          },
        },
      ],
    }
  }, [liquidityLabel, markers, priceLabel, profile, theme, tooltipFormatter, unit])
}
