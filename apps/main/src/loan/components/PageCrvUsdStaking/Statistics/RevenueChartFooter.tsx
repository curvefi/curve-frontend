import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import Stack from '@mui/material/Stack'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Typography from '@mui/material/Typography'
import LegendLine from '@/loan/components/PageCrvUsdStaking/Statistics/components/LegendLine'
import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import { useTheme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Props = {
  timeOptions: TimeOption[]
  activeTimeOption: TimeOption
  setActiveTimeOption: (event: React.MouseEvent<HTMLElement>, newTimeOption: TimeOption) => void
}

const LegendSet = ({ label, dash, legendColor }: { label: string; dash: string; legendColor: string }) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <LegendLine color={legendColor} dash={dash} />
    <Typography variant="bodySRegular">{label}</Typography>
  </Stack>
)

const RevenueChartFooter = ({ timeOptions, activeTimeOption, setActiveTimeOption }: Props) => {
  const {
    design: { Color },
  } = useTheme()
  const averageLineColor = Color.Tertiary[400]
  const sevenDayAverageLineColor = Color.Secondary[500]
  const mainLineColor = Color.Primary[500]

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ paddingInline: Spacing.md }}>
      <Stack direction="row" gap={4}>
        {Object.entries(priceLineLabels).map(([key, { label, dash }]) => (
          <LegendSet
            key={key}
            label={label}
            dash={dash}
            legendColor={
              key === 'proj_apy'
                ? mainLineColor
                : key === 'proj_apy_7d_avg'
                  ? sevenDayAverageLineColor
                  : averageLineColor
            }
          />
        ))}
      </Stack>
      <ToggleButtonGroup exclusive value={activeTimeOption} onChange={setActiveTimeOption}>
        {timeOptions.map((option) => (
          <ToggleButton value={option} key={option} size="extraSmall">
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  )
}

export default RevenueChartFooter
