import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { GaugeWeightHistoryData } from '@/dao/types/dao.types'
import { formatDateFromTimestamp } from '@ui/utils'
import { CustomTooltip as LineChartCustomTooltip } from './LineChartCustomTooltip'

type Props = {
  data: GaugeWeightHistoryData[]
  height?: number
}

export const LineChartComponent = ({ data, height = 400 }: Props) => {
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
          left: 24,
          bottom: 16,
        }}
      >
        <CartesianGrid fillOpacity={0.6} strokeWidth={0.3} vertical={true} />
        <XAxis
          dataKey="epoch"
          tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
          tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          minTickGap={20}
          tickMargin={4}
          tickFormatter={(unixTime) => formatDateFromTimestamp(unixTime)}
        />
        <YAxis
          tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
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
          iconSize={0}
          height={32}
          formatter={() => 'Relative Gauge Weight'}
          wrapperStyle={{
            fontWeight: 'bold',
            fontSize: 'var(--font-size-1)',
            color: 'var(--page--text-color)',
          }}
        />
        <Line
          type="monotone"
          dataKey="gauge_relative_weight"
          stroke="var(--primary-400)"
          strokeWidth={2}
          activeDot={{ r: 4 }}
          dot={{
            r: 3,
            fill: 'var(--primary-400)',
            stroke: 'var(--chart-purple)',
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
