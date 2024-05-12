import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { formatDateFromTimestamp } from '@/ui/utils/utilsFormat'

import LineChartCustomTooltip from './LineChartCustomTooltip'

type Props = {
  data: GaugeWeightHistoryData[]
}

const LineChartComponent = ({ data }: Props) => {
  const height = 400
  const yAxisWidth = 24

  const maxValue = Math.max(...data.map((item) => item.gauge_relative_weight))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 16,
          right: 16,
          left: 16,
          bottom: 16,
        }}
      >
        <CartesianGrid strokeDasharray="3" vertical={false} />
        <XAxis
          dataKey="epoch"
          tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          minTickGap={20}
          tickMargin={4}
          tickFormatter={(unixTime) => {
            return formatDateFromTimestamp(unixTime)
          }}
        />
        <YAxis
          tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
          tickFormatter={(value) => `${value}%`}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          width={yAxisWidth}
          domain={[0, Math.ceil(maxValue)]}
        />
        <Tooltip content={LineChartCustomTooltip} cursor={{ opacity: 0.3 }} />
        <Legend
          margin={{ top: 16, bottom: 16 }}
          verticalAlign="top"
          iconType="circle"
          iconSize={8}
          height={32}
          formatter={(value) => 'Relative Gauge Weight'}
          wrapperStyle={{
            fontWeight: 'bold',
            fontSize: 'var(--font-size-1)',
            color: 'var(--page--text-color)',
          }}
        />
        <Line
          type="monotone"
          dataKey="gauge_relative_weight"
          stroke="var(--chart-purple)"
          strokeWidth={2}
          activeDot={{ r: 4 }}
          dot={{
            r: 2,
            fill: 'var(--white)',
            stroke: 'var(--chart-purple)',
            strokeWidth: 1,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartComponent
