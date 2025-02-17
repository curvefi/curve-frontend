import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusdYield'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import { Stack, Box } from '@mui/material'
import { formatDate } from '@ui/utils/utilsFormat'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import RevenueChartTooltip from '@/loan/components/PageCrvUsdStaking/Statistics/RevenueChartTooltip'
import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'

const { FontSize } = SizesAndSpaces

type Props = { data: ScrvUsdYieldWithAverages[]; height?: number }

const LineChartComponent = ({ data, height = 400 }: Props) => {
  const {
    design: { Color, Text },
  } = useTheme()
  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const averageLineColor = Color.Tertiary[400]
  const sevenDayAverageLineColor = Color.Secondary[500]
  const mainLineColor = Color.Primary[500]

  return (
    <Stack direction="column" spacing={0} width="100%" sx={{ position: 'relative' }}>
      {/* Position relative and width 99% required to make ResponsiveContainer scale properly */}
      <Box width="100%" sx={{ top: 0, left: 0 }}>
        <ResponsiveContainer width="99%" height={height}>
          <LineChart height={300} data={data} margin={{ top: 16, right: 16, left: undefined, bottom: 8 }}>
            <CartesianGrid stroke={gridLineColor} strokeWidth={0.3} vertical={true} />
            <XAxis
              dataKey="date"
              tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
              tickMargin={4}
              tickFormatter={(time) => formatDate(time)}
            />
            <YAxis
              tick={{ fill: gridTextColor, fontSize: FontSize.xs.desktop }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tickLine={false}
              axisLine={false}
              dataKey={'apyProjected'}
            />
            <Tooltip content={RevenueChartTooltip} cursor={{ opacity: 0.3 }} />
            <Line
              type="monotone"
              dataKey="apyProjected"
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
              strokeDasharray={priceLineLabels['proj_apy_7d_avg'].dash}
              activeDot={{ r: 4 }}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="proj_apy_total_avg"
              stroke={averageLineColor}
              strokeWidth={2}
              strokeDasharray={priceLineLabels['proj_apy_total_avg'].dash}
              activeDot={{ r: 4 }}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}

export default LineChartComponent
