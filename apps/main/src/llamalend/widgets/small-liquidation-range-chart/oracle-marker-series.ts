import type { CustomSeriesOption, CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams } from 'echarts'
import { FULL_RANGE_Y_AXIS, ORACLE_MARKER_LAYOUT } from './small-liquidation-range-chart.constants'
import type { ChartColors, ChartTextStyle } from './small-liquidation-range-chart.types'
import { getOracleMarkerLabelWidth } from './small-liquidation-range-chart.utils'

type OracleMarkerCoordSys = CustomSeriesRenderItemParams['coordSys'] & { width?: number; x?: number }

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

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
  // Clamp the label to the rail/grid bounds. Keep the arrow at the actual marker
  // coordinate when it fits under the label; otherwise clamp it to the nearest label edge.
  const labelMaxLeft = Math.max(chartLeft, chartLeft + chartWidth - labelWidth)
  const labelLeft = clamp(markerX - labelWidth / 2, chartLeft, labelMaxLeft)
  const labelCenterX = labelLeft + labelWidth / 2
  const labelTop = trackTopY
  const arrowHalfWidth = ORACLE_MARKER_LAYOUT.arrow.width / 2
  const arrowCenterMin = Math.max(chartLeft + arrowHalfWidth, labelLeft + arrowHalfWidth)
  const arrowCenterMax = Math.min(chartLeft + chartWidth - arrowHalfWidth, labelLeft + labelWidth - arrowHalfWidth)
  const arrowCenterX = clamp(markerX, arrowCenterMin, arrowCenterMax)

  return {
    labelLeft,
    labelTop,
    labelWidth,
    labelCenterX,
    labelCenterY: labelTop + ORACLE_MARKER_LAYOUT.label.height / 2,
    arrowLeft: arrowCenterX - arrowHalfWidth,
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
}): CustomSeriesOption => ({
  // Use a custom series instead of markPoint so the label can be clamped inside the
  // grid while the triangle can still point at the marker coordinate when possible.
  type: 'custom',
  data: [[markerXValue, FULL_RANGE_Y_AXIS[1]]],
  silent: true,
  z: 5,
  ...(xAxisIndex === undefined ? {} : { xAxisIndex }),
  ...(yAxisIndex === undefined ? {} : { yAxisIndex }),
  encode: { x: 0, y: 1 },
  renderItem: (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) => {
    const [markerX, trackTopY] = api.coord([api.value(0), api.value(1)])
    const coordSys = params.coordSys as OracleMarkerCoordSys
    const geometry = getOracleMarkerGeometry({
      chartLeft: coordSys.x ?? 0,
      chartWidth: coordSys.width ?? 0,
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
