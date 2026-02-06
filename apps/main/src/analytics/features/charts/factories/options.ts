import { type ChartOptions, type DeepPartial, ColorType, LineStyle } from 'lightweight-charts'

type ChartPalette = {
  backgroundColor: string
  axisLabelsColor: string
  gridLinesColor: string
  colors: string[]
}

const DEFAULT_MIN_HEIGHT = 400

const createDefault = (chartRef: HTMLElement, palette: ChartPalette): DeepPartial<ChartOptions> => ({
  width: chartRef.clientWidth,
  height: chartRef.clientHeight || DEFAULT_MIN_HEIGHT,
  rightPriceScale: {
    borderVisible: false,
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  },
  leftPriceScale: {
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  },
  layout: {
    background: {
      type: ColorType.Solid,
      color: palette.backgroundColor,
    },
    textColor: palette.axisLabelsColor,
    fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
    attributionLogo: false,
  },
  grid: {
    vertLines: {
      visible: false,
    },
    horzLines: {
      color: palette.gridLinesColor,
      style: LineStyle.SparseDotted,
    },
  },
  timeScale: {
    borderVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  handleScale: false,
  handleScroll: false,
})

/**
 * Creates chart options function that can be passed to useLightweightChart
 *
 * @param options - Optional partial chart options to merge with defaults
 * @param palette - Pallete object containing colors
 * @returns Function that takes a chart element and returns chart options
 */
export function createChartOptions({
  options,
  palette,
}: {
  options?: DeepPartial<ChartOptions>
  palette: ChartPalette
}) {
  return (chartRef: HTMLElement): DeepPartial<ChartOptions> => {
    const _default = createDefault(chartRef, palette)

    return options ? deepMerge(_default, options) : _default
  }
}

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
