import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusdYield'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import { t } from '@lingui/macro'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import RevenueChartTooltip from './RevenueChartTooltip'
import { toUTC } from '@curvefi/prices-api/timestamp'

const { FontSize, FontWeight, Spacing } = SizesAndSpaces

type Props = {
  data: ScrvUsdYieldWithAverages[]
  height?: number
  timeOptions: TimeOption[]
  activeTimeOption: TimeOption
  setActiveTimeOption: (event: React.MouseEvent<HTMLElement>, newTimeOption: TimeOption) => void
}

const LineChartComponent = ({ data, height = 400, timeOptions, activeTimeOption, setActiveTimeOption }: Props) => {
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
    <Stack width="100%" direction="column" spacing={0}>
      <ResponsiveContainer width="100%" height={height} debounce={200}>
        <LineChart
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
            tickLine={false}
            axisLine={false}
            minTickGap={20}
            tickMargin={4}
            tickFormatter={(time) => {
              const unix = toUTC(time as string | number)
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
            tickLine={false}
            axisLine={false}
            dataKey={'proj_apy'}
          />
          <Tooltip content={RevenueChartTooltip} cursor={{ opacity: 0.3 }} />
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
            verticalAlign="bottom"
            align="left"
            iconType="plainline"
            iconSize={20}
            height={32}
            formatter={(value: keyof typeof labels) => labels[value].text}
            wrapperStyle={{
              fontWeight: FontWeight.Medium,
              fontSize: FontSize.sm.desktop,
              color: Text.TextColors.Secondary,
              paddingTop: Spacing.sm.desktop,
              paddingLeft: Spacing.lg.desktop,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ margin: `-2.75rem ${Spacing.lg.desktop} 0 0` }}
      >
        <ToggleButtonGroup exclusive value={activeTimeOption} onChange={setActiveTimeOption}>
          {timeOptions.map((option) => (
            <ToggleButton value={option} key={option} size="extraSmall">
              {option}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}

export default LineChartComponent
