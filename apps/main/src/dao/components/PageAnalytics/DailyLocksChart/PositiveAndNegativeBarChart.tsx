import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { formatDate, formatNumber } from 'ui/src/utils'
import { LocksDaily } from '@curvefi/prices-api/dao'
import { PositiveAndNegativeBarChartTooltip } from './PositiveAndNegativeBarChartTooltip'

type PositiveAndNegativeBarChartProps = {
  data: LocksDaily[]
  height?: number
}

export const PositiveAndNegativeBarChart = ({ data, height = 500 }: PositiveAndNegativeBarChartProps) => (
  <ResponsiveContainer width="100%" height={height} debounce={200}>
    <BarChart
      width={500}
      height={300}
      data={data.map((x) => ({ ...x, amount: x.amount.fromWei() }))}
      margin={{
        top: 16,
        right: 20,
        left: 20,
        bottom: 16,
      }}
    >
      <CartesianGrid fillOpacity={0.6} strokeWidth={0.3} horizontal={true} vertical={false} />
      <XAxis
        dataKey="day"
        tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
        tickFormatter={(value: string) => formatDate(new Date(value))}
        tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        minTickGap={20}
        allowDataOverflow={false}
      />
      <YAxis
        dataKey="amount"
        tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
        tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
        tickFormatter={(value: number) => `${formatNumber(value, { ...(value > 10 && { decimals: 0 }) })}`}
        tickCount={10}
      />
      <Tooltip content={PositiveAndNegativeBarChartTooltip} cursor={{ opacity: 0.3 }} />
      <ReferenceLine y={0} stroke="#000" opacity={0.3} />
      <Bar dataKey="amount" label={false} fill="#8884d8" isAnimationActive={false}>
        {data.map((entry, index) => (
          <Cell key={`$cell-${index}`} fill={entry.amount > 0n ? 'var(--chart-green)' : 'var(--chart-red)'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)
