import type { EChartsOption } from 'echarts'
import type { Theme } from '@mui/material/styles'
import { toArray } from '@primitives/array.utils'

/** Creates a color palette (and font settings) derived from the MUI theme for use in ECharts options. */
export const createPalette = ({ theme }: { theme: Theme }) => ({
  fontFamily: theme.typography.bodyMRegular.fontFamily as string,

  backgroundColor: 'transparent' as const,
  gridLinesColor: theme.design.Color.Neutral[300],
  axisLabelsColor: theme.design.Text.TextColors.Tertiary,

  colors: [theme.design.Chart.Lines.Line1, theme.design.Chart.Lines.Line2, theme.design.Chart.Lines.Line3],
})

type ChartPalette = ReturnType<typeof createPalette>

/** Cast is necessary as the typing of echarts is not in sync with the actual data for some reason. */
type TooltipParam = { axisValue: string; marker: string; seriesName: string; value: number }

/**
 * Creates an ECharts axis tooltip formatter that renders series rows aligned like a table.
 * Each row displays the series marker, name on the left and the formatted value on the right.
 *
 * @param formatter - Function to format each numeric series value (e.g. `formatUsd`)
 * @returns A tooltip `formatter` function ready to pass to ECharts tooltip options
 */
export const createTooltipFormatter = (formatter: (v: number) => string) => (params: unknown) =>
  `<strong>${(params as TooltipParam[])[0].axisValue}</strong>` +
  (params as TooltipParam[])
    .map(
      (item) =>
        `<div style="display:flex;justify-content:space-between;gap:1rem;font-variant-numeric:tabular-nums">` +
        `<span>${item.marker}${item.seriesName}</span>` +
        `<span>${formatter(item.value)}</span>` +
        `</div>`,
    )
    .join('')

/**
 * Creates ECharts options merged with opinionated defaults for the Analytics app.
 *
 * @param options - Chart-specific ECharts options to merge with defaults
 * @param palette - Palette object containing colors
 * @returns Merged EChartsOption ready to pass to ReactECharts
 */
export function createChartOptions({ options, palette }: { options: EChartsOption; palette: ChartPalette }) {
  const withSerieDefaults = {
    ...options,
    series: toArray(options.series).map((serie, i) =>
      deepMerge(createSerieDefaults(palette, i, serie.type), serie as Record<string, unknown>),
    ),
  }
  return deepMerge(createDefaults(palette), withSerieDefaults)
}

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
    axisLabel: { color: palette.axisLabelsColor },
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    axisLine: { show: true, lineStyle: { color: palette.gridLinesColor } },
    axisTick: { show: true, lineStyle: { color: palette.gridLinesColor } },
    splitLine: { lineStyle: { color: palette.gridLinesColor } }, // horizontal grid lines
    axisLabel: { color: palette.axisLabelsColor },
  },
})

const createSerieDefaults = (palette: ChartPalette, i: number, type: string | undefined) => ({
  symbol: 'none',
  // The 2nd line chart should be dashed, hence 'type' is being set
  lineStyle: { color: palette.colors[i], width: 2, ...(i === 1 && type === 'line' && { type: 10 }) },
  itemStyle: { color: palette.colors[i] },
})

/**
 * Recursively merges two objects, with source properties taking precedence over target.
 *
 * This is a custom implementation to replace Lodash's _.merge() as part of our effort
 * to reduce dependencies and remove Lodash from the codebase.
 *
 * This utility performs a deep merge of nested objects and arrays:
 * - Arrays are shallow copied from source to target
 * - Nested objects are recursively merged
 * - Primitive values from source override target values
 *
 * @template T - The type of the target object (extends Record<string, unknown>)
 * @param target - The base object to merge into
 * @param source - The source object whose properties will override target properties
 * @returns A new object with properties from both target and source, with source taking precedence
 *
 * @example
 * ```ts
 * const target = { a: 1, b: { c: 2, d: 3 } }
 * const source = { b: { c: 4 }, e: 5 }
 * const result = deepMerge(target, source)
 * // Result: { a: 1, b: { c: 4, d: 3 }, e: 5 }
 * ```
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result: T = { ...target }

  for (const key in source) {
    if (Array.isArray(source[key])) {
      result[key] = [...(source[key] as unknown[])] as T[Extract<keyof T, string>]
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      ) as T[Extract<keyof T, string>]
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>]
    }
  }

  return result
}
