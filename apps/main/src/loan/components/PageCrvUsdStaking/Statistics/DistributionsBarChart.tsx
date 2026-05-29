import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { Stack, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, amount } from '@ui-kit/utils'
import { DistributionsChartTooltip } from './DistributionsChartTooltip'

const { FontSize } = SizesAndSpaces

interface RevenueDistributionsBarChartProps { data: ScrvUsdRevenue | null; height: number }

export const RevenueDistributionsBarChart = ({ data, height }: RevenueDistributionsBarChartProps) => {
  const {
    design: { Color, Text },
  } = useTheme()
  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const barColor = Color.Secondary[500]

  return (
    <Stack sx={{ position: 'relative' }}>
      {/* Position relative and width 99% required to make ResponsiveContainer scale properly */}
      <Box sx={{ width: '100%', top: 0, left: 0 }}>
        <ResponsiveContainer width="99%" height={height}>
          <BarChart
            width={500}
            height={300}
            data={data?.epochs ?? []}
            margin={{ top: 16, right: 16, left: undefined, bottom: 16 }}
          >
            <CartesianGrid stroke={gridLineColor} strokeWidth={0.3} vertical={true} />
            <XAxis
              dataKey="endDate"
              tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
              tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
              axisLine={false}
              minTickGap={20}
              allowDataOverflow={false}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
              tickFormatter={time => formatDate(time)}
            />
            <YAxis
              dataKey="weeklyRevenue"
              tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
              tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
              axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
              tickFormatter={value => `$${formatNumber(amount(value), { abbreviate: true })}`}
            />
            <Tooltip content={DistributionsChartTooltip} cursor={{ opacity: 0.3 }} />
            <Bar dataKey="weeklyRevenue" label={false} fill={barColor} isAnimationActive={false}>
              {data?.epochs.map((_, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
                <Cell key={`$cell-${index}`} fill={barColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}
