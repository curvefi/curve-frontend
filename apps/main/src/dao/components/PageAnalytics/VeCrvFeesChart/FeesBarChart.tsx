import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate, formatNumber } from 'ui/src/utils'
import type { Distribution } from '@curvefi/prices-api/revenue'
import FeesBarChartTooltip from './FeesBarChartTooltip'

type FeesBarChartProps = {
  data: Distribution[]
  height?: number
}

const FeesBarChart = ({ data, height = 500 }: FeesBarChartProps) => (
  <ResponsiveContainer width="100%" height={height} debounce={200}>
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 16,
        right: 20,
        left: 10,
        bottom: 16,
      }}
    >
      <CartesianGrid fillOpacity={0.6} strokeWidth={0.3} horizontal={true} vertical={false} />
      <XAxis
        dataKey="timestamp"
        tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
        tickFormatter={(value: string) => formatDate(new Date(value))}
        tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        minTickGap={20}
        allowDataOverflow={false}
      />
      <YAxis
        dataKey="feesUsd"
        tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
        tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        tickFormatter={(value) => `${formatNumber(value, { ...(value > 10 && { decimals: 0 }) })}`}
        tickCount={10}
      />
      <Tooltip content={FeesBarChartTooltip} cursor={{ opacity: 0.3 }} />
      <Bar dataKey="feesUsd" label={false} fill={'var(--primary-300)'} isAnimationActive={false}>
        {data.map((_entry, index) => (
          <Cell key={`$cell-${index}`} fill={'var(--primary-300)'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export default FeesBarChart
