import React from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { formatNumber } from 'ui/src/utils'

import FeesBarChartTooltip from './FeesBarChartTooltip'

type FeesBarChartProps = {
  data: VeCrvFee[]
  height?: number
}

const FeesBarChart: React.FC<FeesBarChartProps> = ({ data, height = 500 }) => {
  return (
    <ResponsiveContainer width="100%" height={height} debounce={200}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 16,
          right: 20,
          left: 20,
          bottom: 16,
        }}
      >
        <CartesianGrid strokeDasharray="3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          minTickGap={20}
          allowDataOverflow={false}
        />
        <YAxis
          dataKey="fees_usd"
          tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          tickFormatter={(value) => `${formatNumber(value, { showDecimalIfSmallNumberOnly: true })}`}
          tickCount={10}
        />
        <Tooltip content={FeesBarChartTooltip} cursor={{ opacity: 0.3 }} />
        <Bar dataKey="fees_usd" label={false} fill="#8884d8" isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell key={`$cell-${index}`} fill={+entry.fees_usd > 0 ? 'var(--chart-green)' : 'var(--chart-red)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default FeesBarChart
