import {
  type AutoscaleInfo,
  type AreaSeriesPartialOptions,
  type LineSeriesPartialOptions,
  AreaSeries,
  LineSeries,
  LineType,
} from 'lightweight-charts'

type Formatter = ((x: number) => string) | 'price' | 'percent' | 'volume'

/** Common configuration for series formatters and options */
type BaseSerieParams<T extends string> = {
  name: T
  color: string
  formatter?: Formatter
  autoscaleInfoProvider?: () => AutoscaleInfo | null
}

const DEFAULT_LINE_WIDTH = 2 as const

/** Creates common price format configuration */
function createPriceFormat(formatter?: Formatter) {
  return {
    type: typeof formatter !== 'function' ? (formatter ?? 'custom') : 'custom',
    formatter: typeof formatter === 'function' ? formatter : undefined,
  } as const
}

/**
 * Creates an opiniated area series configuration for a lightweight chart for the Analytics app.
 *
 * @param name Unique identifier for the series
 * @param color Color for the series
 * @param formatter
 *   Custom formatter for data values or predefined format type.
 *   Can be a custom function or one of: "price", "percent", "volume"
 * @param autoscaleInfoProvider Optional function to provide custom autoscale info
 * @returns Configuration object for an area series
 */
export function createAreaSerie<T extends string>({
  name,
  color,
  formatter,
  autoscaleInfoProvider,
}: BaseSerieParams<T>) {
  const options: AreaSeriesPartialOptions = {
    priceFormat: createPriceFormat(formatter),
    lineWidth: DEFAULT_LINE_WIDTH,
    lineType: LineType.WithSteps,
    lineColor: color,
    topColor: `${color}44`,
    bottomColor: `${color}00`,
    lastValueVisible: false,
    priceLineVisible: false,
    autoscaleInfoProvider,
  }

  return {
    type: AreaSeries,
    name,
    options,
  }
}

/**
 * Creates an opiniated line series configuration for a lightweight chart for the Analytics app.
 *
 * @param name Unique identifier for the series
 * @param color Color for the series
 * @param formatter
 *   Custom formatter for data values or predefined format type.
 *   Can be a custom function or one of: "price", "percent", "volume"
 * @param autoscaleInfoProvider Optional function to provide custom autoscale info
 * @returns Configuration object for a line series
 */

export function createLineSerie<T extends string>({
  name,
  color,
  formatter,
  autoscaleInfoProvider,
}: BaseSerieParams<T>) {
  const options: LineSeriesPartialOptions = {
    priceFormat: createPriceFormat(formatter),
    lineWidth: DEFAULT_LINE_WIDTH,
    color,
    lastValueVisible: false,
    priceLineVisible: false,
    autoscaleInfoProvider,
  }

  return {
    type: LineSeries,
    name,
    options,
  }
}
