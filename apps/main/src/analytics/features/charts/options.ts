import type { EChartsOption, SeriesOption } from 'echarts'
import type { Theme } from '@mui/material/styles'
import { toArray } from '@primitives/array.utils'
import { mapRecord } from '@primitives/objects.utils'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import type { DeepPartial } from '@ui-kit/types/util'

/** Recursively merges objects, with source properties taking precedence over the target. */
const deepMerge = <T>(target: T, source: DeepPartial<T>): T => ({
  ...target,
  ...mapRecord(source, (key, value) =>
    Array.isArray(value) ? [...value] : typeof value === 'object' ? deepMerge(target[key as keyof T], value) : value,
  ),
})

/** Creates a color palette (and font settings) derived from the MUI theme for use in ECharts options. */
export const createPalette = ({ theme }: { theme: Theme }) => ({
  fontFamily: theme.typography.bodyMRegular.fontFamily as string,

  backgroundColor: 'transparent' as const,
  gridLinesColor: theme.design.Color.Neutral[300],
  axisLabelsColor: theme.design.Text.TextColors.Tertiary,

  colors: [
    theme.design.Chart.Lines.Line1,
    theme.design.Chart.Lines.Line2,
    theme.design.Chart.Lines.Line3,
    theme.design.Chart.Lines.Line4,
    theme.design.Chart.Lines.Line5,
    theme.design.Chart.Lines.Line6,
    theme.design.Chart.Lines.Line7,
    theme.design.Chart.Lines.Line8,
  ],

  surfaceColors: [
    theme.design.Chart.Surfaces[1],
    theme.design.Chart.Surfaces[2],
    theme.design.Chart.Surfaces[3],
    theme.design.Chart.Surfaces[4],
    theme.design.Chart.Surfaces[5],
    theme.design.Chart.Surfaces[6],
    theme.design.Chart.Surfaces[7],
    theme.design.Chart.Surfaces[8],
  ],
})

type ChartPalette = ReturnType<typeof createPalette>

/** Cast is necessary as the typing of echarts is not in sync with the actual data for some reason. */
type TooltipParam = { axisValue: string; marker: string; seriesName: string; value: number }

/**
 * Creates an ECharts tooltip that renders series rows aligned like a table.
 * Each row displays the series marker, name on the left and the formatted value on the right.
 *
 * @param formatter - Function to format each numeric series value (e.g. `formatUsd`)
 * @returns A tooltip object ready to pass to ECharts tooltip options
 */
export const createTooltip = (formatter: (v: number) => string) => ({
  trigger: 'axis' as const,
  formatter: (params: unknown) =>
    `<strong>${(params as TooltipParam[])[0].axisValue}</strong>` +
    (params as TooltipParam[])
      .map(
        (item) =>
          `<div style="display:flex;justify-content:space-between;gap:1rem;font-variant-numeric:tabular-nums">` +
          `<span>${item.marker}${item.seriesName}</span>` +
          `<span>${formatter(item.value)}</span>` +
          `</div>`,
      )
      .join(''),
})

/** Creates ECharts options merged with opinionated defaults for the Analytics app. */
export const createChartOptions = ({
  legendSets,
  options,
  palette,
}: {
  legendSets: LegendItem[]
  options: EChartsOption
  palette: ChartPalette
}) =>
  deepMerge(createDefaults(palette), {
    ...options,
    series: toArray(options.series)
      .map((serie, index) => ({
        serie,
        toggled: legendSets[index].toggled,
        color: palette.colors[index],
        surfaceColor: palette.surfaceColors[index],
      }))
      .filter(({ toggled }) => toggled !== false)
      .map(({ serie, color, surfaceColor }) => deepMerge(createSerieDefaults(serie, color, surfaceColor), serie)),
  })

const createDefaults = (palette: ChartPalette): EChartsOption => ({
  animation: false, // this often looks weird due to shifting timescales
  backgroundColor: palette.backgroundColor,
  textStyle: { fontFamily: palette.fontFamily, color: palette.axisLabelsColor },
  grid: { left: '0%', right: '0%', bottom: '0%', top: '0%' }, // use all available space
  xAxis: {
    type: 'category',
    axisLine: { show: true, lineStyle: { color: palette.gridLinesColor } },
    axisTick: { show: true, lineStyle: { color: palette.gridLinesColor } },
    splitLine: { show: true, lineStyle: { color: palette.gridLinesColor } }, // vertical grid lines
    axisLabel: {
      color: palette.axisLabelsColor,
      align: 'left' /** fixes y axis shifting to right due to first x axis label */,
    },
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    position: 'right',
    axisLine: { show: true, lineStyle: { color: palette.gridLinesColor } },
    axisTick: { show: true, lineStyle: { color: palette.gridLinesColor } },
    splitLine: { lineStyle: { color: palette.gridLinesColor } }, // horizontal grid lines
    axisLabel: { color: palette.axisLabelsColor },
  },
})

const createSerieDefaults = (serie: SeriesOption, color: string, surfaceColor: string): SeriesOption => ({
  symbol: 'circle',
  symbolSize: 8,
  showSymbol: false, // hidden by default, only shown on hover (emphasis below)
  emphasis: {
    scale: true,
    disabled: false,
    itemStyle: { color: '#fff', borderColor: color, borderWidth: 2 }, // white fill only on hover dot
  },
  silent: true, // Removes the pointer cursor when hovering on line, clicking does nothing anyway?
  lineStyle: { color, width: 2 },
  itemStyle: { color, borderColor: color, borderWidth: 2 }, // tooltip marker color
  ...('areaStyle' in serie && { areaStyle: { color: surfaceColor, opacity: 1 } }),
})

/** Converts a UTC timestamp (ms) to an ISO date string (YYYY-MM-DD) for use as an ECharts category axis value. */
export const timeToCategory = (x: number) => new Date(x).toISOString().slice(0, 10)
