import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { styled } from 'styled-components'
import { TOP_HOLDERS } from '@/dao/constants'
import type { TopHoldersSortBy } from '@/dao/types/dao.types'
import type { Locker } from '@curvefi/prices-api/dao'
import { formatNumber } from '@ui/utils'
import { shortenAddress } from '@ui-kit/utils'
import CustomTooltip from './TopHoldersBarChartTooltip'

type TopHoldersBarChartProps = {
  data: Locker[]
  filter: TopHoldersSortBy
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

const TopHoldersBarChart = ({ data, filter }: TopHoldersBarChartProps) => {
  const height = 300
  const labelWidth = 100

  const userFormatter = (user: string): string => {
    const address = user.toLowerCase()

    if (TOP_HOLDERS[address]) {
      return TOP_HOLDERS[address].title
    }

    return user.length > 15 ? (shortenAddress(user)?.toString() ?? user) : user
  }

  const dataFormatted = data.map((x) => ({
    ...x,
    weight: x.weight.fromWei(),
    locked: x.locked.fromWei(),
  }))

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height={height} debounce={200}>
        <BarChart
          layout="horizontal"
          width={500}
          height={height}
          data={dataFormatted}
          margin={{
            top: 16,
            right: 16,
            left: 0,
            bottom: 16,
          }}
        >
          <CartesianGrid fillOpacity={0.6} strokeWidth={0.3} horizontal={true} vertical={false} />
          <XAxis
            type="category"
            dataKey="user"
            width={labelWidth}
            tickFormatter={userFormatter}
            tick={{
              fill: 'var(--page--text-color)',
              fontWeight: 'var(--bold)',
              fontSize: 'var(--font-size-1)',
              textAnchor: 'end',
            }}
            tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
            axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
            angle={-45}
            height={60}
          />
          <YAxis
            type="number"
            dataKey={filter}
            interval={0}
            tick={{ fill: 'var(--page--text-color)', fontWeight: 'var(--bold)', fontSize: 'var(--font-size-1)' }}
            tickFormatter={(value) =>
              filter === 'weightRatio' ? `${value}%` : formatNumber(value, { notation: 'compact' })
            }
            tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
            axisLine={false}
            dx={-4}
          />
          <Tooltip content={CustomTooltip} cursor={{ opacity: 0.3 }} />
          <Bar dataKey={filter} label={false} isAnimationActive={false}>
            {dataFormatted.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const ChartContainer = styled.div<{ height: number }>`
  position: relative;
  width: 100%;
  height: ${({ height }) => height}px;
`

export default TopHoldersBarChart
