import type { ScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatNumber, formatDate } from '@ui/utils/utilsFormat'
import { useTheme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { toDate } from '@curvefi/prices-api/timestamp'
import { Stack, Box } from '@mui/material'
import DistributionsChartTooltip from './DistributionsChartTooltip'

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
    <Stack direction="column" spacing={0} width="100%" sx={{ position: 'relative' }}>
      {/* Position relative and width 99% required to make ResponsiveContainer scale properly */}
      <Box width="100%" sx={{ top: 0, left: 0 }}>
        <ResponsiveContainer width="99%" height={height}>
          <BarChart
            width={500}
            height={300}
            data={data?.epochs ?? []}
            margin={{
              top: 16,
              right: 16,
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
                const date = toDate(time as string | number)
                return formatDate(date)
              }}
            />
            <YAxis
              dataKey="weeklyRevenue"
              tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
              tickLine={{ fill: gridLineColor, strokeWidth: 0.5 }}
              axisLine={{ opacity: 0.3, strokeWidth: 0.3 }}
              tickFormatter={(value) => `$${formatNumber(value, { notation: 'compact' })}`}
            />
            <Tooltip content={DistributionsChartTooltip} cursor={{ opacity: 0.3 }} />
            <Bar dataKey="weeklyRevenue" label={false} fill={barColor} isAnimationActive={false}>
              {data?.epochs.map((entry, index) => <Cell key={`$cell-${index}`} fill={barColor} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}

export default RevenueDistributionsBarChart
