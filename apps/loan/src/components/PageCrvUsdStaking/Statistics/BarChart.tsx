import type { ScrvUsdRevenue } from '@loan/entities/scrvusdRevenue'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber } from '@ui/utils/utilsFormat'
import { useTheme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { toUTC } from '../utils'

const { FontSize } = SizesAndSpaces

type RevenueDistributionsBarChartProps = {
  data: ScrvUsdRevenue | null
  height?: number
}

const RevenueDistributionsBarChart: React.FC<RevenueDistributionsBarChartProps> = ({ data, height = 400 }) => {
  const {
    design: { Color, Text },
  } = useTheme()
  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const barColor = Color.Secondary[500]

  return (
    <ResponsiveContainer width="100%" height={height} debounce={200}>
      <BarChart
        width={500}
        height={300}
        data={data?.epochs ?? []}
        margin={{
          top: 16,
          right: 20,
          left: undefined,
          bottom: 16,
        }}
      >
        <CartesianGrid stroke={gridLineColor} strokeWidth={0.3} vertical={true} />
        <XAxis
          dataKey="endDate"
          tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
          tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
          axisLine={false}
          minTickGap={20}
          allowDataOverflow={false}
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
          dataKey="weeklyRevenue"
          tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
          tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
          axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
          tickFormatter={(value) => `$${formatNumber(value, { notation: 'compact' })}`}
        />
        {/* <Tooltip content={RevenueDistributionsBarChartTooltip} cursor={{ opacity: 0.3 }} /> */}
        <Bar dataKey="weeklyRevenue" label={false} fill={barColor} isAnimationActive={false}>
          {data?.epochs.map((entry, index) => <Cell key={`$cell-${index}`} fill={barColor} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueDistributionsBarChart
