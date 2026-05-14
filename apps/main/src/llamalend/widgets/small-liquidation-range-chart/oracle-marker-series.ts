import { FULL_RANGE_Y_AXIS, ORACLE_MARKER_LAYOUT } from './small-liquidation-range-chart.constants'
import type { ChartColors, ChartTextStyle } from './small-liquidation-range-chart.types'

type OracleMarkerRenderParams = { coordSys?: { width?: number; x?: number } }
type OracleMarkerRenderApi = {
  value: (index: number) => number
  coord: (point: number[]) => number[]
}

const toEChartsPixelValue = (value: number | string, htmlFontSize: number) => {
  if (typeof value === 'number') return value

  const numericValue = Number.parseFloat(value)
  return value.endsWith('rem') ? numericValue * htmlFontSize : numericValue
}

const getOracleMarkerLabelWidth = ({
  htmlFontSize,
  text,
  textStyle,
}: {
  htmlFontSize: number
  text: string
  textStyle: ChartTextStyle
}) => {
  const estimatedTextWidth = text.length * textStyle.fontSize * ORACLE_MARKER_LAYOUT.label.estimatedCharacterWidthRatio
  const horizontalPadding = toEChartsPixelValue(ORACLE_MARKER_LAYOUT.label.horizontalPadding, htmlFontSize)

  return estimatedTextWidth + horizontalPadding * 2
}

const getOracleMarkerGeometry = ({
  chartLeft,
  chartWidth,
  htmlFontSize,
  markerX,
  text,
  textStyle,
  trackTopY,
}: {
  chartLeft: number
  chartWidth: number
  htmlFontSize: number
  markerX: number
  text: string
  textStyle: ChartTextStyle
  trackTopY: number
}) => {
  const labelWidth = getOracleMarkerLabelWidth({ htmlFontSize, text, textStyle })
  // Keep the arrow attached to the clamped label so truncated oracle markers stay visually grouped.
  const labelLeft = Math.min(Math.max(markerX - labelWidth / 2, chartLeft), chartLeft + chartWidth - labelWidth)
  const labelCenterX = labelLeft + labelWidth / 2
  const labelTop = trackTopY

  return {
    labelLeft,
    labelTop,
    labelWidth,
    labelCenterX,
    labelCenterY: labelTop + ORACLE_MARKER_LAYOUT.label.height / 2,
    arrowLeft: labelCenterX - ORACLE_MARKER_LAYOUT.arrow.width / 2,
    arrowTop: labelTop + ORACLE_MARKER_LAYOUT.label.height,
  }
}

export const buildOracleMarkerSeries = ({
  colors,
  formattedOraclePrice,
  htmlFontSize,
  markerXValue,
  textStyle,
  xAxisIndex,
  yAxisIndex,
}: {
  colors: ChartColors
  formattedOraclePrice: string
  htmlFontSize: number
  markerXValue: number
  textStyle: ChartTextStyle
  xAxisIndex?: number
  yAxisIndex?: number
}) => ({
  type: 'custom' as const,
  data: [[markerXValue, FULL_RANGE_Y_AXIS[1]]],
  silent: true,
  z: 5,
  ...(xAxisIndex === undefined ? {} : { xAxisIndex }),
  ...(yAxisIndex === undefined ? {} : { yAxisIndex }),
  encode: { x: 0, y: 1 },
  renderItem: (params: OracleMarkerRenderParams, api: OracleMarkerRenderApi) => {
    const [markerX, trackTopY] = api.coord([api.value(0), api.value(1)])
    const geometry = getOracleMarkerGeometry({
      chartLeft: params.coordSys?.x ?? 0,
      chartWidth: params.coordSys?.width ?? 0,
      htmlFontSize,
      markerX,
      text: formattedOraclePrice,
      textStyle,
      trackTopY,
    })

    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          shape: {
            x: geometry.labelLeft,
            y: geometry.labelTop,
            width: geometry.labelWidth,
            height: ORACLE_MARKER_LAYOUT.label.height,
          },
          style: {
            fill: colors.oracleMarkerLabelBackground,
          },
        },
        {
          type: 'text',
          style: {
            x: geometry.labelCenterX,
            y: geometry.labelCenterY,
            text: formattedOraclePrice,
            fill: colors.oracleMarkerLabel,
            fontSize: textStyle.fontSize,
            fontWeight: textStyle.fontWeight,
            lineHeight: textStyle.lineHeight,
            fontFamily: textStyle.fontFamily,
            align: 'center',
            verticalAlign: 'middle',
          },
        },
        {
          type: 'path',
          x: geometry.arrowLeft,
          y: geometry.arrowTop,
          shape: {
            pathData: ORACLE_MARKER_LAYOUT.arrow.pathData,
          },
          style: {
            fill: colors.referenceLine,
          },
        },
      ],
    }
  },
})
