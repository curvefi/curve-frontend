import styled from 'styled-components'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

import CustomTooltip from './CustomTooltip'

type Props = {
  data: GaugeChartData[]
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

const BarChartComponent = ({ data }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const height = 500
  const labelWidth = 100

  const reducedData = data.filter((item, index) => {
    return item.gauge_relative_weight > 0.5
  })

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          width={500}
          height={height}
          data={reducedData}
          margin={{
            top: 24,
            right: 32,
            left: 24,
            bottom: 8,
          }}
        >
          <CartesianGrid strokeDasharray="3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
            tickFormatter={(value) => `${value}%`}
            tickLine={{ opacity: 0.8, strokeWidth: 0.5 }}
            axisLine={{ opacity: 0.5, strokeWidth: 0.5 }}
          />
          <YAxis
            type="category"
            dataKey="title"
            width={labelWidth}
            interval={1}
            tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
            tickLine={{ opacity: 0.8, strokeWidth: 0.5 }}
            axisLine={{ opacity: 0.5, strokeWidth: 0.5 }}
          />
          <Tooltip content={CustomTooltip} cursor={{ opacity: 0.3 }} />
          <Bar dataKey="gauge_relative_weight" label={false} isAnimationActive={false}>
            {reducedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={activeIndex === index ? 0.8 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
`

export default BarChartComponent
