import { createChart } from 'lightweight-charts'
import type {
  DeepPartial,
  ChartOptions,
  SeriesType as SeriesTypeOriginal,
  ISeriesApi,
  SeriesPartialOptionsMap as SeriesPartialOptionsMapOriginal,
  SeriesDefinition as SeriesDefinitionOriginal,
  IChartApi,
} from 'lightweight-charts'
import { useEffect, useEffectEvent, useRef, useState, type RefObject } from 'react'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'

// We extend the original types with our own custom series types.
type SeriesTypeCustom = 'StackedArea' | 'StackedBars'
type SeriesType = SeriesTypeOriginal | SeriesTypeCustom

/** The default options map extended with our own custom types */
type SeriesPartialOptionsMap = SeriesPartialOptionsMapOriginal & {
  StackedArea: never // TODO: Replace with StackedAreaSeriesPartialOptions when implemented
  StackedBars: never // TODO: Replace with StackedBarsSeriesPartialOptions when implemented
}

type SeriesDefinition<T extends SeriesType> = T extends SeriesTypeOriginal
  ? SeriesDefinitionOriginal<T>
  : SeriesDefinitionOriginal<'Custom'>

/**
 * Defines a series for the chart
 * @template T - The type of series (e.g., LineSeries, CandlestickSeries, AreaSeries, 'StackedArea')
 * @example
 * const lineSeries: Serie<'Line'> = {
 *   name: 'price' as const,
 *   type: LineSeries,
 *   options: { color: 'blue' }
 * };
 */
type Serie<T extends SeriesType> = {
  /** Unique identifier for accessing the series after creation */
  name: string
  /** Series type definition or custom type string */
  type: SeriesDefinition<T> | SeriesTypeCustom
  /** Configuration options for the series */
  options: SeriesPartialOptionsMap[T]
}

type Series = Serie<SeriesType>[]

// Helper type to extract series type directly from the type property with default to 'Custom'
type ExtractSeriesType<T> = T extends SeriesTypeCustom
  ? 'Custom'
  : T extends { type: infer U }
    ? U extends SeriesTypeOriginal
      ? U
      : 'Custom'
    : 'Custom'

/**
 * Maps series names to their API instances
 *
 * Provides type-safe access to series instances after chart creation.
 * Each series is mapped by its name to the corresponding ISeriesApi instance.
 * Custom series types are mapped to 'Custom' API type.
 *
 * @example
 * // Define series with const assertions for type safety
 * const series = [
 *   {
 *     name: 'price' as const,
 *     type: LineSeries,
 *   },
 *   {
 *     name: 'stacked' as const,
 *     type: 'StackedArea',
 *   }
 * ];
 *
 * // The resulting SeriesMap type will be:
 * {
 *   price: ISeriesApi<'Line'> | undefined;
 *   stacked: ISeriesApi<'Custom'> | undefined;
 * }
 */
type SeriesMap<T extends Series> = {
  [K in T[number]['name']]: ISeriesApi<ExtractSeriesType<Extract<T[number], { name: K }>['type']>> | undefined
}

/** Options for the useLightweightChart hook */
type Options<T extends Series> = {
  /** Function to create chart options based on container element (hence it's a factory function) */
  createChartOptions: (chartRef: HTMLElement) => DeepPartial<ChartOptions>
  /** Single series definition or array of series definitions */
  series: T
}

/**
 * React hook that creates and manages an opinionated lightweight chart for the Analytics app.
 *
 * Automatically handles:
 * - Chart creation and cleanup
 * - Series initialization
 * - Responsive resizing based on parent container
 * - Series options updates
 *
 * @template T - Array of series definitions
 * @param options - Chart configuration object
 * @returns Chart instance, container ref, and series map
 *
 * @example
 * const { chart, chartRef, series } = useLightweightChart({
 *   createChartOptions: (el) => ({
 *     width: el.clientWidth,
 *     height: el.clientHeight,
 *   }),
 *   series: [
 *     {
 *       name: 'price' as const,
 *       type: LineSeries,
 *       options: {
 *         color: 'hsl(123, 90%, 66%),
 *         lineWidth: 2,
 *         priceFormat: {
 *           type: 'custom',
 *           formatter: (x: number) => `$${x.toFixed(2)}`,
 *         },
 *       },
 *     },
 *     {
 *       name: 'volume' as const,
 *       type: AreaSeries,
 *       options: {
 *         lineColor: hsl(230, 90%, 66%),
 *         topColor: 'rgba(32, 129, 240, 0.2)',
 *         bottomColor: 'rgba(32, 129, 240, 0)',
 *       },
 *     },
 *   ],
 * });
 *
 * // Accessing the created series
 * series.volume?.setData([
 *   { time: '2021-01-01', value: 1000 },
 *   { time: '2021-01-02', value: 1200 },
 * ]);
 */
export function useLightweightChart<T extends Series>(
  options: Options<T>,
): {
  chart: IChartApi | undefined
  chartRef: RefObject<HTMLDivElement | null>
  series: SeriesMap<T>
} {
  const { createChartOptions, series } = options

  const [chart, setChart] = useState<IChartApi | undefined>(undefined)
  const [seriesMap, setSeriesMap] = useState({} as SeriesMap<T>)

  const chartRef = useRef<HTMLDivElement | null>(null)

  const onCreateChart = useEffectEvent(() => {
    if (!chartRef.current) return

    const chartOptions = createChartOptions(chartRef.current)
    const newChart = createChart(chartRef.current, chartOptions)

    const newSeriesMap = series.reduce((acc, serieDef) => {
      const seriesApi = newChart.addSeries(
        serieDef.type as SeriesDefinitionOriginal<SeriesTypeOriginal>,
        serieDef.options,
      )

      // Type assertions are unfortunately all needed
      acc[serieDef.name as keyof SeriesMap<T>] = seriesApi as SeriesMap<T>[keyof SeriesMap<T>]
      return acc
    }, {} as SeriesMap<T>)

    setSeriesMap(newSeriesMap)
    setChart(newChart)

    return newChart
  })

  // Create chart and series when container is mounted (only once)
  useEffect(() => {
    const newChart = onCreateChart()
    if (!newChart) return

    return () => {
      newChart.remove()
    }
  }, [])

  // Update series options when they change
  useEffect(() => {
    for (const { name, options } of series) {
      seriesMap[name as keyof SeriesMap<T>]?.applyOptions(options)
    }
  }, [seriesMap, series])

  // Handle resize
  const dimensions = useResizeObserver(chartRef)

  useEffect(() => {
    if (!chart || !dimensions) return

    const [width, height] = dimensions
    chart.applyOptions({ width, height })
    chart.timeScale().fitContent()
  }, [chart, dimensions])

  return { chart, chartRef, series: seriesMap }
}
