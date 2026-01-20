import { inRange } from 'lodash'
import type { ReactNode } from 'react'
import {
  Bar,
  ComposedChart,
  Label,
  LabelList,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Props as LegendContentProps } from 'recharts/types/component/DefaultLegendContent'
import { styled } from 'styled-components'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Box as LegacyBox } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { formatNumber } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { HealthColorKey } from '../llamalend.types'

const { Spacing, Sizing } = SizesAndSpaces

export interface LiquidationRangeData {
  name: string
  curr: number[]
  new: number[]
  oraclePrice: string
  oraclePriceBand: number | null
  newLabel?: string
}

export interface ChartLiquidationRangeProps {
  data: LiquidationRangeData[]
  healthColorKey: HealthColorKey | undefined
  height?: number
  isDetailView?: boolean
  isManage?: boolean
  showLegend?: boolean
  tooltipContent?: (params: TooltipContentProps) => ReactNode
}

export interface TooltipContentProps {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[]
  oraclePrice: string
  isManage: boolean
  chartHealthColor: string
}

const DefaultTooltipContent = ({ active, payload, oraclePrice, isManage, chartHealthColor }: TooltipContentProps) => {
  if (!active || !payload || !payload.length || !oraclePrice) return null

  const currPrices = isManage ? payload.find((p) => p.name === 'curr') : undefined
  const newPrices = isManage ? payload.find((p) => p.name === 'new') : payload[0]

  const [cp1, cp2] = currPrices ? (currPrices.payload.curr as string[]) : []
  const [np1, np2] = (newPrices?.payload.new as string[]) ?? []
  const oraclePriceValue = newPrices?.payload.oraclePrice

  return (
    <ChartTooltip>
      {currPrices && !!cp1 && !!cp2 && (
        <div>
          <TipTitle>{t`Liquidation range`}</TipTitle>
          <TipContent>
            <TipIcon name="Stop" size={20} fill={currPrices.stroke} />{' '}
            <>{`${formatNumber(cp2)} - ${formatNumber(cp1)}`}</>
          </TipContent>
        </div>
      )}
      {!!np1 && !!np2 && (
        <div>
          <TipTitle>{t`Liquidation range${currPrices ? ' (new)' : ''}`}</TipTitle>
          <TipContent>
            <TipIcon name="StopFilledAlt" fill={chartHealthColor} size={20} />{' '}
            {`${formatNumber(np1)} - ${formatNumber(np2)}`}
          </TipContent>
        </div>
      )}
      <div>
        <TipTitle>{t`Oracle price`}</TipTitle>
        <TipContent>{formatNumber(oraclePriceValue)}</TipContent>
      </div>
    </ChartTooltip>
  )
}

const LegendContent = ({ payload }: LegendContentProps) => (
  <Stack gap={Spacing.xs}>
    {payload?.map(({ color, type, value }, index) => (
      <Stack direction="row" key={index} gap={Spacing.xs}>
        <Stack
          sx={{
            width: Sizing.xs,
            height: Sizing.xs,
            ...(type === 'line'
              ? { stroke: color, '& svg': { width: Sizing.xs, height: Sizing.xs } }
              : { backgroundColor: color }),
          }}
          className={`recharts-reference-line-${type}`}
        >
          {type == 'line' && (
            <svg viewBox="0 0 16 16">
              <line strokeWidth={2} x1={0} y1={8} x2={16} y2={8} className="recharts-reference-line-line" />
            </svg>
          )}
        </Stack>
        <Typography variant="bodySRegular" color="text.secondary">
          {value}
        </Typography>
      </Stack>
    ))}
  </Stack>
)

export const ChartLiquidationRange = ({
  data,
  healthColorKey,
  height = 85,
  isDetailView = false,
  isManage = false,
  showLegend = false,
  tooltipContent,
}: ChartLiquidationRangeProps) => {
  const oraclePrice = data[0]?.oraclePrice
  const haveCurrData = data[0]?.curr[0] > 0
  const haveNewData = data[0]?.new[0] > 0
  const isInLiquidationRange = haveCurrData ? inRange(+oraclePrice, data[0].curr[1], data[0].curr[0]) : false
  const theme = useTheme()
  const showFireStyle = isInLiquidationRange && theme.key === 'chad'

  const chartAxisColor = isDetailView ? 'var(--chart_axis--color)' : 'var(--chart_axis_darkBg--color)'
  const chartReferenceLineColor = isDetailView
    ? 'var(--chart_reference_line--color)'
    : 'var(--chart_reference_line_darkBg--color)'
  const chartHealthColor = isDetailView
    ? `var(--health_mode_${healthColorKey}_darkBg--color)`
    : `var(--health_mode_${healthColorKey}--color)`
  const chartLabelColor = isDetailView ? 'var(--chart_label--color)' : 'var(--chart_label_darkBg--color)'

  const TooltipContentComponent = tooltipContent || DefaultTooltipContent

  return (
    <Wrapper chartHeight={height}>
      <InnerWrapper>
        <ResponsiveContainer width="99%" height={height}>
          <ComposedChart layout="vertical" barGap={-30} data={data} margin={{ left: 5, top: 10 }}>
            <XAxis
              type="number"
              xAxisId={0}
              interval="preserveStartEnd"
              stroke={chartAxisColor}
              tick={{ fontSize: 12 }}
              tickFormatter={(tick) => `${formatNumber(tick, { ...(tick > 10 && { decimals: 0 }) })}`}
              domain={([dataMin, dataMax]) => {
                // add 0.1 spacing to min and max data
                const min = Math.floor(dataMin - dataMin * 0.1)
                let max
                if (dataMax > +oraclePrice) {
                  max = Math.round(dataMax + dataMax * 0.1)
                } else if (+oraclePrice < 10) {
                  max = +oraclePrice * 1.5
                } else if (+oraclePrice > dataMax) {
                  // add more to max to prevent oracle price from getting cut off
                  max = +oraclePrice + +oraclePrice * 0.1
                } else {
                  max = +oraclePrice + 200
                }
                return [min, max]
              }}
            />
            <YAxis
              dataKey="name"
              scale="band"
              stroke={chartAxisColor}
              opacity={0}
              type="category"
              width={5}
              tick={false}
            />
            <Tooltip
              cursor={false}
              wrapperStyle={{ zIndex: 1000 }}
              content={({ active, payload }) => (
                <TooltipContentComponent
                  active={active || false}
                  payload={payload || []}
                  oraclePrice={oraclePrice}
                  isManage={isManage}
                  chartHealthColor={chartHealthColor}
                />
              )}
            />
            <defs>
              <pattern
                id="pattern-stripe"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width={2} height={8} transform="translate(0,0)" fill={chartLabelColor}></rect>
              </pattern>
              <mask id="mask-stripe">
                <rect x={0} y={0} width="100%" height="100%" fill="url(#pattern-stripe)" />
              </mask>
            </defs>
            {/* curr liq range bar */}
            {haveCurrData && (
              <Bar
                dataKey="curr"
                barSize={30}
                fill="#1763fd00"
                stroke={chartAxisColor}
                shape={(props: unknown) => {
                  const { x, y, width, height } = props as { x: number; y: number; width: number; height: number }
                  return (
                    <path
                      fill="url(#pattern-stripe)"
                      stroke={chartAxisColor}
                      strokeWidth={2}
                      opacity={0.4}
                      width={width}
                      height={height}
                      x={x}
                      y={y}
                      radius="0"
                      className="recharts-rectangle"
                      d={`M ${x},${y} h ${width} v ${height} h ${Math.abs(width)} Z`}
                    />
                  )
                }}
                strokeWidth={1}
              />
            )}
            {/* new liq range bar */}
            <Bar
              dataKey="new"
              barSize={30}
              xAxisId={0}
              fill={chartHealthColor}
              opacity={0.8}
              stroke="transparent"
              strokeWidth={1}
            >
              <LabelList
                dataKey="newLabel"
                position="insideLeft"
                fill={chartLabelColor}
                fontSize={10}
                fontWeight="bold"
                formatter={(val: string) => (haveNewData ? val : '')}
              />
            </Bar>
            {/* oracle price reference line */}
            {oraclePrice !== '' && (
              <ReferenceLine
                isFront
                x={oraclePrice}
                {...(showFireStyle
                  ? {
                      opacity: 0.2,
                      stroke: chartReferenceLineColor,
                      strokeWidth: 1,
                      label: ({ viewBox }) => (
                        <svg
                          x={viewBox.x - 31}
                          y={viewBox.y - 6}
                          width={50}
                          height={50}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <image x={16} y={13} width={30} height={50} xlinkHref="/images/fire.gif" />
                          <text x={8} y={8} fontSize={11} fontWeight="bold" fill={chartReferenceLineColor}>
                            Oracle
                          </text>
                        </svg>
                      ),
                    }
                  : {
                      opacity: 1,
                      stroke: chartReferenceLineColor,
                      strokeWidth: 1,
                      label: (
                        <Label
                          value={t`Oracle`}
                          fill={chartReferenceLineColor}
                          fontSize={11}
                          fontWeight="bold"
                          offset={2}
                          position="top"
                        />
                      ),
                    })}
              />
            )}
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                align="left"
                iconType="rect"
                wrapperStyle={{ color: chartLabelColor }}
                payload={[
                  {
                    value: `${t`Oracle Price`} (${formatNumber(oraclePrice, { currency: 'USD' })})`,
                    type: 'line',
                    color: chartReferenceLineColor,
                  },
                  {
                    value: `${t`Liquidation Range`} (${data.map((d) => d.new.map((n) => formatNumber(n, { currency: 'USD' })).join(' - ')).join(', ')})`,
                    type: 'rect',
                    color: chartHealthColor,
                  },
                ]}
                content={LegendContent}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
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

const TooltipWrapper = styled(LegacyBox)`
  background-color: var(--tooltip--background-color);
  color: var(--tooltip--color);
  font-size: var(--font-size-2);
  outline: none;
  padding: 1rem 1.25rem;
`

const ChartTooltip = ({ children }: { children: ReactNode }) => (
  <TooltipWrapper grid gridRowGap={2}>
    {children}
  </TooltipWrapper>
)

const TipTitle = styled.div`
  font-weight: bold;
  margin-bottom: 2px;
`

const TipContent = styled(LegacyBox)`
  align-items: center;
  display: grid;
  justify-content: flex-start;

  @media (min-width: ${breakpoints.sm}rem) {
    display: flex;
  }
`

const TipIcon = styled(Icon)`
  position: relative;
  left: -2px;
`
