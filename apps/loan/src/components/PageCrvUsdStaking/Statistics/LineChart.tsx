import type { ScrvUsdYieldWithAverages } from '@loan/entities/scrvusdYield'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import { t } from '@lingui/macro'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import CustomTooltip from './ChartTooltip'
import { formatDateFromTimestamp } from '@ui/utils/utilsFormat'
import { toUTC } from '../utils'

const { FontSize } = SizesAndSpaces

type Props = {
  data: ScrvUsdYieldWithAverages[]
  height?: number
}

const LineChartComponent = ({ data, height = 400 }: Props) => {
  const {
    design: { Color, Text },
  } = useTheme()
  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const averageLineColor = Color.Tertiary[400]
  const sevenDayAverageLineColor = Color.Secondary[500]
  const mainLineColor = Color.Primary[500]

  const labels = {
    proj_apy: { text: t`APR`, dash: 'none' },
    proj_apy_7d_avg: { text: t`7-day MA APR`, dash: '2 2' },
    proj_apy_total_avg: { text: t`Average APR`, dash: '4 4' },
  } as const

  return (
    <ResponsiveContainer width="100%" height={height} debounce={200}>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 16,
          right: 16,
          left: undefined,
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
          tickFormatter={(time) => {
            const unix = toUTC(time as string | number) * 1000
            return new Intl.DateTimeFormat(undefined, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(unix)
          }}
        />
        <YAxis
          tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
          tickFormatter={(value) => `${value.toFixed(0)}%`}
          tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
          axisLine={false}
          dataKey={'proj_apy'}
        />
        <Tooltip content={CustomTooltip} cursor={{ opacity: 0.3 }} />
        <Line
          type="monotone"
          dataKey="proj_apy"
          stroke={mainLineColor}
          strokeWidth={2}
          activeDot={{ r: 4 }}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="proj_apy_7d_avg"
          stroke={sevenDayAverageLineColor}
          strokeWidth={2}
          strokeDasharray={labels['proj_apy_7d_avg'].dash}
          activeDot={{ r: 4 }}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="proj_apy_total_avg"
          stroke={averageLineColor}
          strokeWidth={2}
          strokeDasharray={labels['proj_apy_total_avg'].dash}
          activeDot={{ r: 4 }}
          dot={false}
          isAnimationActive={false}
        />
        <Legend
          margin={{ top: 16, bottom: 16 }}
          verticalAlign="bottom"
          align="left"
          iconType="plainline"
          iconSize={20}
          height={32}
          formatter={(value: keyof typeof labels) => labels[value].text}
          wrapperStyle={{
            fontWeight: 'bold',
            fontSize: 'var(--font-size-1)',
            color: 'var(--page--text-color)',
            paddingLeft: 24,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default LineChartComponent
