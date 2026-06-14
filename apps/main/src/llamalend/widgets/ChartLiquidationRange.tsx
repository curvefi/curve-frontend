import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams, EChartsOption, SeriesOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { inRange } from 'lodash'
import { useMemo, type ReactNode } from 'react'
import { styled } from 'styled-components'
import Stack from '@mui/material/Stack'
import { useTheme, type Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import {
  ChartStateWrapper,
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
  ChartTooltipShell,
  useEChartsTooltip,
} from '@ui-kit/shared/ui/Chart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, amount } from '@ui-kit/utils'
import type { HealthColorKey } from '../llamalend.types'

const { Spacing, Sizing } = SizesAndSpaces

export type LiquidationRangeData = {
  name: string
  curr: number[]
  new: number[]
  oraclePrice: string
  oraclePriceBand: number | null
  newLabel?: string
}

type ChartLiquidationRangeProps = {
  data: LiquidationRangeData[]
  healthColorKey: HealthColorKey | undefined
  height?: number
  isDetailView?: boolean
  isManage?: boolean
  showLegend?: boolean
  tooltipContent?: (params: TooltipContentProps) => ReactNode
}

type TooltipContentProps = {
  active?: boolean
  payload: TooltipPayloadItem[]
  oraclePrice: string
  isManage: boolean
  chartHealthColor: string
}

type TooltipPayloadItem = { name?: string | number; stroke?: string; payload?: LiquidationRangeData }

type LegendItem = {
  value: string
  type: 'line' | 'rect'
  color: string
}

const RANGE_BAR_HEIGHT = 30

const getHealthModeColor = (healthColorKey: HealthColorKey | undefined, theme: Theme) => {
  const { Feedback } = theme.design.Layer
  const colors = {
    healthy: Feedback.Success,
    close_to_liquidation: Feedback.Warning,
    soft_liquidation: Feedback.Danger,
    hard_liquidation: Feedback.Error,
    '': undefined,
  } satisfies Record<HealthColorKey, string | undefined>

  return colors[healthColorKey ?? '']
}

const calculateChartDomain = ({ curr, new: next, oraclePrice }: LiquidationRangeData): [number, number] => {
  const oraclePriceValue = +oraclePrice
  const rangeValues = [...curr, ...next].filter(value => value > 0)
  const dataMin = rangeValues.length ? Math.min(...rangeValues) : 0
  const dataMax = rangeValues.length ? Math.max(...rangeValues) : 1
  const min = Math.floor(dataMin - dataMin * 0.1)

  if (dataMax > oraclePriceValue) {
    return [min, Math.round(dataMax + dataMax * 0.1)]
  }

  if (oraclePriceValue < 10) {
    return [min, oraclePriceValue * 1.5]
  }

  if (oraclePriceValue > dataMax) {
    return [min, oraclePriceValue + oraclePriceValue * 0.1]
  }

  return [min, oraclePriceValue + 200]
}

const createRangeRenderItem =
  ({
    borderColor,
    fillColor,
    label,
    labelColor,
    opacity,
  }: {
    borderColor: string
    fillColor: string
    label?: string
    labelColor: string
    opacity: number
  }) =>
  (_params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) => {
    const start = Number(api.value(0))
    const end = Number(api.value(1))
    const startPoint = api.coord([start, 0.5])
    const endPoint = api.coord([end, 0.5])
    const x = Math.min(startPoint[0], endPoint[0])
    const y = startPoint[1] - RANGE_BAR_HEIGHT / 2
    const width = Math.max(Math.abs(endPoint[0] - startPoint[0]), 1)

    return {
      type: 'group' as const,
      children: [
        {
          type: 'rect' as const,
          shape: { x, y, width, height: RANGE_BAR_HEIGHT },
          style: { fill: fillColor, stroke: borderColor, lineWidth: 2, opacity },
        },
        ...(label
          ? [
              {
                type: 'text' as const,
                style: {
                  x: x + 8,
                  y: startPoint[1],
                  text: label,
                  fill: labelColor,
                  fontSize: 10,
                  fontWeight: 700,
                  textVerticalAlign: 'middle' as const,
                },
              },
            ]
          : []),
      ],
    }
  }

const createRangeSeries = ({
  borderColor,
  data,
  fillColor,
  label,
  labelColor,
  name,
  opacity,
}: {
  borderColor: string
  data: number[]
  fillColor: string
  label?: string
  labelColor: string
  name: string
  opacity: number
}): SeriesOption => ({
  type: 'custom',
  name,
  data: [data],
  renderItem: createRangeRenderItem({ borderColor, fillColor, label, labelColor, opacity }),
})

const DefaultTooltipContent = ({ active, payload, oraclePrice, isManage, chartHealthColor }: TooltipContentProps) => {
  if (!active || !payload?.length || !oraclePrice) return null

  const currPrices = isManage ? payload.find(p => p.name === 'curr') : undefined
  const newPrices = isManage ? payload.find(p => p.name === 'new') : payload[0]

  const [cp1, cp2] = currPrices?.payload?.curr ?? []
  const [np1, np2] = newPrices?.payload?.new ?? []
  const oraclePriceValue = newPrices?.payload?.oraclePrice

  return (
    <ChartTooltipShell title={t`Liquidation range`}>
      <ChartTooltipSeriesGroup>
        {currPrices && !!cp1 && !!cp2 && (
          <ChartTooltipSeriesRow
            label={t`Current range`}
            lineColor={currPrices.stroke ?? chartHealthColor}
            value={`${formatNumber(amount(cp2), { abbreviate: false, fallback: '-' })} - ${formatNumber(amount(cp1), { abbreviate: false, fallback: '-' })}`}
          />
        )}
        {!!np1 && !!np2 && (
          <ChartTooltipSeriesRow
            label={currPrices ? t`New range` : t`Liquidation range`}
            lineColor={chartHealthColor}
            value={`${formatNumber(amount(np1), { abbreviate: false, fallback: '-' })} - ${formatNumber(amount(np2), { abbreviate: false, fallback: '-' })}`}
          />
        )}
        <ChartTooltipDataRow
          label={t`Oracle price`}
          value={formatNumber(amount(oraclePriceValue), { abbreviate: false, fallback: '-' })}
        />
      </ChartTooltipSeriesGroup>
    </ChartTooltipShell>
  )
}

const LegendContent = ({ items }: { items: LegendItem[] }) => (
  <Stack sx={{ gap: Spacing.xs }}>
    {items.map(({ color, type, value }, index) => (
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      <Stack direction="row" key={index} sx={{ gap: Spacing.xs }}>
        <Stack
          sx={{
            width: Sizing.xs,
            height: Sizing.xs,
            ...(type === 'line'
              ? { stroke: color, '& svg': { width: Sizing.xs, height: Sizing.xs } }
              : { backgroundColor: color }),
          }}
        >
          {type == 'line' && (
            <svg viewBox="0 0 16 16">
              <line strokeWidth={2} x1={0} y1={8} x2={16} y2={8} />
            </svg>
          )}
        </Stack>
        <Typography variant="bodySRegular" sx={{ color: 'text.secondary' }}>
          {value}
        </Typography>
      </Stack>
    ))}
  </Stack>
)

/** @deprecated in favour of SmallLiquidationRangeChart */
export const ChartLiquidationRange = ({
  data,
  healthColorKey,
  height = 85,
  isDetailView = false,
  isManage = false,
  showLegend = false,
  tooltipContent,
}: ChartLiquidationRangeProps) => {
  const theme = useTheme()
  const chartData = useMemo<LiquidationRangeData>(
    () => data[0] ?? { name: '', curr: [0, 0], new: [0, 0], oraclePrice: '', oraclePriceBand: null },
    [data],
  )
  const oraclePrice = chartData.oraclePrice
  const haveCurrData = chartData.curr[0] > 0
  const haveNewData = chartData.new[0] > 0
  const isInLiquidationRange = haveCurrData && inRange(+oraclePrice, chartData.curr[1], chartData.curr[0])
  const showFireStyle = isInLiquidationRange && theme.key === 'chad'
  const {
    design: { Color, Text },
  } = theme

  const chartAxisColor = isDetailView ? Color.Neutral[600] : Text.TextColors.Tertiary
  const chartReferenceLineColor = Color.Primary[500]
  const chartHealthColor = getHealthModeColor(healthColorKey, theme) ?? chartReferenceLineColor
  const chartLabelColor = isDetailView ? Text.TextColors.Tertiary : Text.TextColors.Primary

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
  const TooltipContentComponent = tooltipContent || DefaultTooltipContent
  const tooltipPayload = useMemo<TooltipPayloadItem[]>(
    () => [
      ...(haveCurrData ? [{ name: 'curr', stroke: chartAxisColor, payload: chartData }] : []),
      { name: 'new', stroke: chartHealthColor, payload: chartData },
    ],
    [chartAxisColor, chartData, chartHealthColor, haveCurrData],
  )
  const tooltipFormatter = useEChartsTooltip([chartData], theme, () => (
    <TooltipContentComponent
      active
      payload={tooltipPayload}
      oraclePrice={oraclePrice}
      isManage={isManage}
      chartHealthColor={chartHealthColor}
    />
  ))
  const chartDomain = useMemo(() => calculateChartDomain(chartData), [chartData])
  const legendItems = useMemo<LegendItem[]>(
    () => [
      {
        value: `${t`Oracle Price`} (${formatNumber(amount(oraclePrice), 'usd.amount')})`,
        type: 'line',
        color: chartReferenceLineColor,
      },
      {
        value: `${t`Liquidation Range`} (${data.map(d => d.new.map(n => formatNumber(n, 'usd.amount')).join(' - ')).join(', ')})`,
        type: 'rect',
        color: chartHealthColor,
      },
    ],
    [chartHealthColor, chartReferenceLineColor, data, oraclePrice],
  )
  const series = useMemo<SeriesOption[]>(
    () => [
      ...(haveCurrData
        ? [
            createRangeSeries({
              borderColor: chartAxisColor,
              data: chartData.curr,
              fillColor: chartLabelColor,
              labelColor: chartLabelColor,
              name: 'curr',
              opacity: 0.25,
            }),
          ]
        : []),
      createRangeSeries({
        borderColor: 'transparent',
        data: chartData.new,
        fillColor: chartHealthColor,
        label: haveNewData ? chartData.newLabel : undefined,
        labelColor: chartLabelColor,
        name: 'new',
        opacity: 0.8,
      }),
      {
        type: 'line',
        data: [
          [chartDomain[0], 0.5],
          [chartDomain[1], 0.5],
        ],
        showSymbol: false,
        silent: true,
        lineStyle: { opacity: 0 },
        ...(oraclePrice !== '' && {
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            label: {
              show: true,
              formatter: t`Oracle`,
              position: 'insideEndTop',
              color: chartReferenceLineColor,
              fontSize: 11,
              fontWeight: 'bold',
            },
            lineStyle: {
              color: chartReferenceLineColor,
              opacity: showFireStyle ? 0.2 : 1,
              width: 1,
            },
            data: [{ xAxis: +oraclePrice }],
          },
        }),
      },
    ],
    [
      chartAxisColor,
      chartData.curr,
      chartData.new,
      chartData.newLabel,
      chartDomain,
      chartHealthColor,
      chartLabelColor,
      chartReferenceLineColor,
      haveCurrData,
      haveNewData,
      oraclePrice,
      showFireStyle,
    ],
  )
  const option = useMemo<EChartsOption>(
    () => ({
      animation: false,
      grid: { left: 5, top: 10, right: 5, bottom: showLegend ? 34 : 0 },
      xAxis: {
        type: 'value',
        min: chartDomain[0],
        max: chartDomain[1],
        axisLine: { lineStyle: { color: chartAxisColor } },
        axisTick: { lineStyle: { color: chartAxisColor } },
        splitLine: { show: false },
        axisLabel: {
          color: chartAxisColor,
          fontSize: 12,
          formatter: (tick: number) =>
            `${formatNumber(amount(tick), { ...(tick > 10 && { decimals: 0 }), abbreviate: false, fallback: '-' })}`,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        show: false,
      },
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: tooltipFormatter,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      },
      series,
    }),
    [chartAxisColor, chartDomain, series, showLegend, tooltipFormatter],
  )

  return (
    <Wrapper chartHeight={height}>
      <InnerWrapper>
        <ChartStateWrapper height={height} isLoading={false} errorMessage="Unable to render liquidation range chart.">
          <ReactECharts option={option} notMerge style={{ width: '100%', height }} />
          {showLegend && (
            <LegendWrapper>
              <LegendContent items={legendItems} />
            </LegendWrapper>
          )}
        </ChartStateWrapper>
      </InnerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ chartHeight: number }>`
  width: 100%;
  height: ${({ chartHeight }) => `${chartHeight}px`};
  position: relative;
`

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

const LegendWrapper = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
`
