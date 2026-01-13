import { ReactNode } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { styled } from 'styled-components'

type Props<T> = {
  data: T[]
  dataKey: keyof T & string
  CustomTooltip: (props: TooltipProps<ValueType, NameType>) => ReactNode
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

export const BarChartComponent = <T extends object>({ data, dataKey, CustomTooltip }: Props<T>) => {
  const height = 300
  const labelWidth = 100

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="horizontal"
          width={500}
          height={height}
          data={data}
          margin={{
            top: 16,
            right: 8,
            left: 48,
            bottom: 60,
          }}
        >
          <CartesianGrid fillOpacity={0.6} strokeWidth={0.3} horizontal={true} vertical={false} />
          <XAxis
            type="category"
            dataKey="title"
            width={labelWidth}
            interval={data.length > 50 ? 1 : 0}
            tick={{
              fill: 'var(--page--text-color)',
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
            orientation="right"
            tick={{ fill: 'var(--page--text-color)', fontSize: 'var(--font-size-1)' }}
            tickFormatter={(value) => `${value}%`}
            tickLine={{ opacity: 0.3, strokeWidth: 0.3 }}
            axisLine={false}
            dx={4}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} />} cursor={{ opacity: 0.3 }} />
          <Bar dataKey={dataKey as string} label={false}>
            {data.map((_, index) => (
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
