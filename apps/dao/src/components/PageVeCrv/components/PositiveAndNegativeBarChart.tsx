import React, { PureComponent } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { t } from '@lingui/macro'

import { formatNumber } from 'ui/src/utils'

import PositiveAndNegativeBarChartCustomTooltip from './PositiveAndNegativeBarChartCustomTooltip'

type Props = {
  data: VeCrvDailyLock[]
  height?: number
}

const PositiveAndNegativeBarChart = ({ data, height = 500 }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
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
          dataKey="day"
          tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          minTickGap={20}
          allowDataOverflow={false}
        />
        <YAxis
          dataKey="amount"
          tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          tickFormatter={(value) => `${formatNumber(value, { showDecimalIfSmallNumberOnly: true })}`}
          tickCount={10}
        />
        <Tooltip content={PositiveAndNegativeBarChartCustomTooltip} cursor={{ opacity: 0.3 }} />
        <ReferenceLine y={0} stroke="#000" opacity={0.3} />
        <Bar dataKey="amount" label={false} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`$cell-${index}`} fill={+entry.amount > 0 ? 'var(--chart-green)' : 'var(--chart-red)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default PositiveAndNegativeBarChart
