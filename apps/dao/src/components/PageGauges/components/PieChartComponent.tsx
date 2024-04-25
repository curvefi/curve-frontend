import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import styled from 'styled-components'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'
import { t } from '@lingui/macro'
import { useState } from 'react'

import Box from '@/ui/Box'

type Props = {
  data: PieData[]
}

type CustomLabelProps = {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
  payload: PieData
}

const COLORS = [
  '#f94144',
  '#f3722c',
  '#F8961E',
  '#F9844A',
  '#F9C74F',
  '#90BE6D',
  '#43AA8B',
  '#4D908E',
  '#577590',
  '#277DA1',
]

const PieChartComponent = ({ data }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const height = 300

  return (
    <Wrapper chartHeight={height}>
      <InnerWrapper>
        <ResponsiveContainer width={'99%'} height={height}>
          <PieChart width={300} height={300}>
            <Pie
              dataKey="gauge_relative_weight"
              nameKey="title"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={CustomLabel}
              stroke="white"
              strokeWidth={0.5}
              style={{ outline: 'none' }}
              labelLine={false}
              isAnimationActive={false}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={activeIndex === index ? 0.8 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </InnerWrapper>
    </Wrapper>
  )
}

// Custom label component
const CustomLabel = ({ payload, cx, cy, midAngle, outerRadius, index }: CustomLabelProps) => {
  if (payload.gauge_relative_weight > 2) {
    const RADIAN = Math.PI / 180
    // Calculate the starting point at the edge of the pie slice
    const startRadius = outerRadius * 0.99 // Slightly inside the outer edge to ensure visibility
    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN)
    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN)

    // Calculate the label position further out
    const labelRadius = outerRadius * 1.2
    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN)
    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN)

    // Calculate the shortened line endpoint
    const shorteningFactor = 10 // 5 pixels shorter
    const adjustedLineX = labelX - shorteningFactor * Math.cos(-midAngle * RADIAN)
    const adjustedLineY = labelY - shorteningFactor * Math.sin(-midAngle * RADIAN)

    const linePath = `M${startX},${startY} L${adjustedLineX},${adjustedLineY}`

    return (
      <>
        <path d={linePath} stroke={COLORS[index % COLORS.length]} strokeWidth={1} fill="none" />
        <CellLabel
          key={`label-${index}`}
          x={labelX}
          y={labelY}
          dy={3}
          fill="black"
          textAnchor={labelX > cx ? 'start' : 'end'}
        >
          {payload.title} ({payload.gauge_relative_weight.toFixed(2)}%)
        </CellLabel>
      </>
    )
  }
  return null
}

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const sevenDayDelta = payload[0].payload.gauge_weight_7d_delta
    const sixtyDayDelta = payload[0].payload.gauge_weight_60d_delta

    return (
      <TooltipWrapper>
        <TooltipTitle>{payload[0].name}</TooltipTitle>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <TooltipColumn>
            <TooltipDataTitle>{t`Relative Weight`}</TooltipDataTitle>
            <TooltipData>{payload[0].payload.gauge_relative_weight}%</TooltipData>
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Gauge weight 7d delta`}</TooltipDataTitle>
            {sevenDayDelta ? (
              <TooltipData className={sevenDayDelta > 0 ? 'positive' : 'negative'}>{sevenDayDelta}%</TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`Not available`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
          <TooltipColumn>
            <TooltipDataTitle>{t`Gauge weight 60d delta`}</TooltipDataTitle>
            {sixtyDayDelta ? (
              <TooltipData className={sixtyDayDelta > 0 ? 'positive' : 'negative'}>{sixtyDayDelta}%</TooltipData>
            ) : (
              <TooltipDataNotAvailable>{t`Not available`}</TooltipDataNotAvailable>
            )}
          </TooltipColumn>
        </Box>
      </TooltipWrapper>
    )
  }

  return null
}

const Wrapper = styled.div<{ chartHeight: number }>`
  width: 550px;
  height: ${({ chartHeight }) => `${chartHeight}px`};
  position: relative;
  margin: 0 auto;
`

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

const CellLabel = styled.text`
  font-size: var(--font-size-1);
  fill: var(--page--text-color);
  font-weight: var(--bold);
`

const TooltipWrapper = styled.div`
  background-color: var(--page--background-color);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const TooltipTitle = styled.p`
  font-size: var(--font-size-3);
  color: var(--page--text-color);
  font-weight: var(--bold);
`

const TooltipColumn = styled.div`
  display: flex;
  flex-direction: column;
`

const TooltipDataTitle = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.7;
  color: var(--page--text-color);
`

const TooltipData = styled.p`
  font-size: var(--font-size-2);
  color: var(--page--text-color);
  font-weight: var(--bold);
  &.positive {
    color: var(--chart-green);
  }
  &.negative {
    color: var(--chart-red);
  }
`
const TooltipDataNotAvailable = styled.p`
  font-size: var(--font-size-2);
  color: var(--page--text-color);
  font-style: italic;
`

export default PieChartComponent
