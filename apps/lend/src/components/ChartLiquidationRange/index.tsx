import {
  Bar,
  ComposedChart,
  Label,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { t } from '@lingui/macro'
import React from 'react'
import inRange from 'lodash/inRange'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'

import ChartTooltip, { TipContent, TipIcon, TipTitle } from '@/components/ChartTooltip'
import type { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'

interface Props {
  data: { name: string; curr: number[]; new: number[]; oraclePrice: string; oraclePriceBand: number | null }[]
  healthColorKey: HeathColorKey | undefined
  height?: number
  isDetailView?: boolean // component not inside the form
  isManage: boolean
  theme: ThemeKey
}

const ChartLiquidationRange = ({ height, data, healthColorKey, isManage, isDetailView, theme }: Props) => {
  const oraclePrice = data[0]?.oraclePrice
  const haveCurrData = data[0]?.curr[0] > 0
  const haveNewData = data[0]?.new[0] > 0
  const isInLiquidationRange = haveCurrData ? inRange(+oraclePrice, data[0].curr[1], data[0].curr[0]) : false
  const showFireStyle = isInLiquidationRange && theme === 'chad'
  const chartHeight = height || 85
  const chartAxisColor = isDetailView ? 'var(--chart_axis--color)' : 'var(--chart_axis_darkBg--color)'
  const chartReferenceLineColor = isDetailView
    ? 'var(--chart_reference_line--color)'
    : 'var(--chart_reference_line_darkBg--color)'
  const chartHealthColor = isDetailView
    ? `var(--health_mode_${healthColorKey}_darkBg--color)`
    : `var(--health_mode_${healthColorKey}--color)`
  const chartLabelColor = isDetailView ? 'var(--chart_label--color)' : 'var(--chart_label_darkBg--color)'

  return (
    <Wrapper chartHeight={chartHeight}>
      <InnerWrapper>
        <ResponsiveContainer width={'99%'} height={chartHeight}>
          <ComposedChart layout="vertical" barGap={-30} data={data} margin={{ left: 5, top: 10 }}>
            <XAxis
              type="number"
              xAxisId={0}
              interval="preserveStartEnd"
              stroke={chartAxisColor}
              tick={{ fontSize: 12 }}
              tickFormatter={(tick) => `${formatNumber(tick, { showDecimalIfSmallNumberOnly: true })}`}
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

            {/* chart tooltip */}
            <Tooltip
              cursor={false}
              wrapperStyle={{ zIndex: 1000 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length && !!oraclePrice) {
                  // should be same order as chart Line, Bar, Bar
                  const currPrices = isManage ? payload.find((p) => p.name === 'curr') : undefined
                  const newPrices = isManage ? payload.find((p) => p.name === 'new') : payload[0]

                  const [cp1, cp2] = currPrices ? (currPrices.payload.curr as string[]) : []
                  const [np1, np2] = (newPrices?.payload.new as string[]) ?? []
                  const oraclePrice = newPrices?.payload.oraclePrice

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
                        <TipContent>{formatNumber(oraclePrice)}</TipContent>
                      </div>
                    </ChartTooltip>
                  )
                }
                return null
              }}
            />

            {/* stripe pattern */}
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
                shape={({ x, y, width, height }) => (
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
                )}
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
                position="inside"
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

export default ChartLiquidationRange
