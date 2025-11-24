import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import {
  customSeriesDefaultOptions,
  LineStyle,
  type CustomData,
  type CustomSeriesOptions,
  type CustomSeriesPricePlotValues,
  type CustomSeriesWhitespaceData,
  type ICustomSeriesPaneRenderer,
  type ICustomSeriesPaneView,
  type PaneRendererCustomData,
  type PriceToCoordinateConverter,
  type Time,
} from 'lightweight-charts'

type Coordinate = number

export type LiquidationRangePoint = CustomData<Time> & {
  upper: number
  lower: number
  rangeStartTime?: Time
  rangeEndTime?: Time
}

export type LiquidationRangeSeriesOptions = CustomSeriesOptions & {
  fillColor: string
  fillOpacity: number
  topLineColor: string
  bottomLineColor: string
  lineWidth: number
  lineStyle: LineStyle
  showTopLine?: boolean
  showBottomLine?: boolean
}

const DEFAULT_OPTIONS: LiquidationRangeSeriesOptions = {
  ...customSeriesDefaultOptions,
  color: '#000000',
  lastValueVisible: false,
  priceLineVisible: false,
  fillColor: 'rgba(0, 0, 0, 0.15)',
  fillOpacity: 1,
  topLineColor: '#000000',
  bottomLineColor: '#000000',
  lineWidth: 1,
  lineStyle: LineStyle.Solid,
  showTopLine: true,
  showBottomLine: true,
}

type PreparedPoint = {
  x: number
  upper: Coordinate
  lower: Coordinate
}

type RendererPayload = {
  data: PaneRendererCustomData<Time, LiquidationRangePoint> | null
  options: LiquidationRangeSeriesOptions
}

// Tiny factory that keeps payload state outside the renderer object LW charts consumes.
const createRenderer = () => {
  const payload: RendererPayload = {
    data: null,
    options: DEFAULT_OPTIONS,
  }

  const renderer: ICustomSeriesPaneRenderer = {
    draw(target, priceConverter) {
      drawSeries(payload, target, priceConverter)
    },
  }

  return {
    renderer,
    setPayload(data: PaneRendererCustomData<Time, LiquidationRangePoint>, options: LiquidationRangeSeriesOptions) {
      payload.data = data
      payload.options = options
    },
  }
}

// Entry point invoked by LW charts whenever the pane needs repainting.
const drawSeries = (
  payload: RendererPayload,
  target: CanvasRenderingTarget2D,
  priceConverter: PriceToCoordinateConverter,
) => {
  if (!payload.data || !payload.data.bars.length) return

  const points = collectVisiblePoints(payload, priceConverter)
  if (!points.length) return

  target.useBitmapCoordinateSpace((scope) => {
    const ctx = scope.context
    ctx.save()
    ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio)

    fillBand(ctx, points, payload.options)
    drawBoundary(ctx, points, 'upper', payload.options)
    drawBoundary(ctx, points, 'lower', payload.options)

    ctx.restore()
  })
}

// Converts the currently visible bars into screen coordinates, filtering missing values.
const collectVisiblePoints = (
  payload: RendererPayload,
  priceConverter: PriceToCoordinateConverter,
): PreparedPoint[] => {
  const { data } = payload
  if (!data) return []

  const { bars, visibleRange } = data
  if (!bars.length) return []

  const rangeStart = visibleRange ? Math.max(0, Math.floor(visibleRange.from)) : 0
  const rangeEnd = visibleRange ? Math.min(bars.length - 1, Math.ceil(visibleRange.to)) : bars.length - 1

  const points: PreparedPoint[] = []
  for (let i = rangeStart; i <= rangeEnd; i += 1) {
    const bar = bars[i]
    const { upper, lower } = bar.originalData

    if (upper == null || lower == null) continue
    if (!isWithinTimeWindow(bar.originalData)) continue

    const upperCoord = priceConverter(upper)
    const lowerCoord = priceConverter(lower)

    if (upperCoord === null || lowerCoord === null) continue

    points.push({
      x: bar.x,
      upper: upperCoord,
      lower: lowerCoord,
    })
  }

  return points
}

const fillBand = (ctx: CanvasRenderingContext2D, points: PreparedPoint[], options: LiquidationRangeSeriesOptions) => {
  const { fillColor, fillOpacity } = options
  if (fillOpacity <= 0) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].upper)

  points.forEach((point) => {
    ctx.lineTo(point.x, point.upper)
  })

  for (let i = points.length - 1; i >= 0; i -= 1) {
    const point = points[i]
    ctx.lineTo(point.x, point.lower)
  }

  ctx.closePath()

  const previousAlpha = ctx.globalAlpha
  ctx.globalAlpha = fillOpacity
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.globalAlpha = previousAlpha
}

const drawBoundary = (
  ctx: CanvasRenderingContext2D,
  points: PreparedPoint[],
  key: keyof Pick<PreparedPoint, 'upper' | 'lower'>,
  options: LiquidationRangeSeriesOptions,
) => {
  const shouldShow = key === 'upper' ? options.showTopLine !== false : options.showBottomLine !== false
  if (!shouldShow) return

  const colorKey = key === 'upper' ? 'topLineColor' : 'bottomLineColor'
  const color = options[colorKey]

  const { lineWidth, lineStyle } = options
  if (!color || lineWidth <= 0) return

  ctx.beginPath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color

  if (lineStyle === LineStyle.Dashed || lineStyle === LineStyle.LargeDashed) {
    ctx.setLineDash(lineStyle === LineStyle.Dashed ? [6, 6] : [12, 6])
  } else if (lineStyle === LineStyle.Dotted) {
    ctx.setLineDash([2, 4])
  } else if (lineStyle === LineStyle.SparseDotted) {
    ctx.setLineDash([2, 8])
  } else {
    ctx.setLineDash([])
  }

  ctx.moveTo(points[0].x, points[0][key])
  points.forEach((point) => ctx.lineTo(point.x, point[key]))
  ctx.stroke()
}

const isWithinTimeWindow = (point: LiquidationRangePoint): boolean => {
  const pointTimestamp = toTimestamp(point.time)
  const startTimestamp = toTimestamp(point.rangeStartTime)
  const endTimestamp = toTimestamp(point.rangeEndTime)

  if (pointTimestamp == null) {
    return true
  }

  if (startTimestamp !== undefined && pointTimestamp < startTimestamp) {
    return false
  }

  if (endTimestamp !== undefined && pointTimestamp > endTimestamp) {
    return false
  }

  return true
}

const toTimestamp = (time?: Time): number | undefined => {
  if (time == null) {
    return undefined
  }

  if (typeof time === 'number') {
    return time
  }

  if (typeof time === 'string') {
    const parsed = Date.parse(time)
    return Number.isNaN(parsed) ? undefined : Math.floor(parsed / 1000)
  }

  if ('year' in time && 'month' in time && 'day' in time) {
    return Math.floor(Date.UTC(time.year, time.month - 1, time.day) / 1000)
  }

  return undefined
}

const priceValueBuilder = (plotRow: LiquidationRangePoint): CustomSeriesPricePlotValues => [
  plotRow.upper,
  plotRow.lower,
]

const isWhitespacePoint = (
  data: LiquidationRangePoint | CustomSeriesWhitespaceData<Time>,
): data is CustomSeriesWhitespaceData<Time> =>
  !('upper' in data && 'lower' in data) ||
  data.upper == null ||
  data.lower == null ||
  Number.isNaN(data.upper) ||
  Number.isNaN(data.lower)

const createLiquidationRangePaneView = (): ICustomSeriesPaneView<
  Time,
  LiquidationRangePoint,
  LiquidationRangeSeriesOptions
> => {
  const { renderer, setPayload } = createRenderer()

  return {
    renderer: () => renderer,
    update(data, options) {
      setPayload(data, options)
    },
    priceValueBuilder,
    isWhitespace: isWhitespacePoint,
    defaultOptions: () => ({ ...DEFAULT_OPTIONS }),
  }
}

export const createLiquidationRangeSeries = () => createLiquidationRangePaneView()
