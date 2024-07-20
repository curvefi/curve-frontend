import styled from 'styled-components'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { shortenTokenAddress, formatNumberWithSuffix } from '@/ui/utils'

import CustomTooltip from './BarChartCustomTooltip'

type Props = {
  data: VeCrvTopLocker[]
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
  const height = 500
  const labelWidth = 100

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          width={500}
          height={1000}
          data={data}
          margin={{
            top: 16,
            right: 16,
            left: 16,
            bottom: 16,
          }}
        >
          <CartesianGrid strokeDasharray="3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
            dataKey="weight"
            tickFormatter={(weight) => formatNumberWithSuffix(weight)}
            tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
            axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          />
          <YAxis
            type="category"
            dataKey="user"
            width={labelWidth}
            interval={1}
            tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
            tickFormatter={(user) => (typeof user === 'string' ? shortenTokenAddress(user) : user)}
            tickLine={{ opacity: 0.3, strokeWidth: 0.5 }}
            axisLine={{ opacity: 0.3, strokeWidth: 0.5 }}
          />
          <Tooltip content={CustomTooltip} cursor={{ opacity: 0.3 }} />
          <Bar dataKey="weight" label={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
