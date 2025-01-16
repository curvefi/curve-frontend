import type { ScrvUsdYieldWithAverages } from '@/entities/scrvusdYield'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import { t } from '@lingui/macro'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import CustomTooltip from './ChartTooltip'

import { formatDateFromTimestamp } from '@/ui/utils/utilsFormat'

// import LineChartCustomTooltip from './LineChartCustomTooltip'
const { FontSize } = SizesAndSpaces

type Props = {
  data: ScrvUsdYieldWithAverages[]
  height?: number
}

const LineChartComponent = ({ data, height = 400 }: Props) => {
  const yAxisWidth = 24
  const {
    design: { Color, Text },
  } = useTheme()
  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const averageLineColor = Color.Tertiary[400]
  const sevenDayAverageLineColor = Color.Secondary[500]
  const mainLineColor = Color.Primary[500]

  // const maxValue = Math.max(...data.map((item) => item.gauge_relative_weight))

  console.log(data)

  const labels = {
    proj_apy: { text: t`Historical APR`, dash: 'none' },
    proj_apy_7d_avg: { text: t`7-day Average APR`, dash: '2 2' },
    proj_apy_total_avg: { text: t`Average APR`, dash: '4 4' },
  } as const

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
        <CartesianGrid stroke={gridLineColor} strokeWidth={0.3} vertical={true} />
        <XAxis
          dataKey="timestamp"
          tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
          tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
          axisLine={false}
          minTickGap={20}
          tickMargin={4}
          tickFormatter={(unixTime) => formatDateFromTimestamp(unixTime)}
        />
        <YAxis
          tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
          tickFormatter={(value) => `${value}%`}
          tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
          axisLine={false}
          width={yAxisWidth}
          // domain={[0, Math.ceil(maxValue)]}
        />
        <Tooltip content={CustomTooltip} cursor={{ opacity: 0.3 }} />
        <Line
          type="monotone"
          dataKey="proj_apy"
          stroke={mainLineColor}
          strokeWidth={2}
          activeDot={{ r: 4 }}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="proj_apy_7d_avg"
          stroke={sevenDayAverageLineColor}
          strokeWidth={2}
          strokeDasharray={labels['proj_apy_7d_avg'].dash}
          activeDot={{ r: 4 }}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="proj_apy_total_avg"
          stroke={averageLineColor}
          strokeWidth={2}
          strokeDasharray={labels['proj_apy_total_avg'].dash}
          activeDot={{ r: 4 }}
          dot={false}
        />
        <Legend
          margin={{ top: 16, bottom: 16 }}
          verticalAlign="bottom"
          iconType="line"
          iconSize={20}
          height={32}
          formatter={(value: keyof typeof labels) => labels[value].text}
          wrapperStyle={{
            fontWeight: 'bold',
            fontSize: 'var(--font-size-1)',
            color: 'var(--page--text-color)',
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartComponent
