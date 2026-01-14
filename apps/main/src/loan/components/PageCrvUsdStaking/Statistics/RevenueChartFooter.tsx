import { MouseEvent } from 'react'
import { LegendLine } from '@/loan/components/PageCrvUsdStaking/Statistics/components/LegendLine'
import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Props = {
  timeOptions: TimeOption[]
  activeTimeOption: TimeOption
  setActiveTimeOption: (event: MouseEvent<HTMLElement>, newTimeOption: TimeOption) => void
}

const LegendSet = ({ label, dash, legendColor }: { label: string; dash: string; legendColor: string }) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <LegendLine color={legendColor} dash={dash} />
    <Typography variant="bodySRegular">{label}</Typography>
  </Stack>
)

export const RevenueChartFooter = ({ timeOptions, activeTimeOption, setActiveTimeOption }: Props) => {
  const {
    design: { Color },
  } = useTheme()

  const priceLineColors = {
    apyProjected: Color.Primary[500],
    proj_apy_7d_avg: Color.Secondary[500],
    proj_apy_total_avg: Color.Tertiary[400],
  } as const satisfies Record<YieldKeys, string>

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ paddingInline: Spacing.md, paddingBottom: Spacing.md }}
    >
      <Stack direction="row" gap={4} flexWrap="wrap">
        {Object.entries(priceLineLabels).map(([key, { label, dash }]) => (
          <LegendSet
            key={key}
            label={label}
            dash={dash}
            legendColor={
              key === 'apyProjected'
                ? priceLineColors.apyProjected
                : key === 'proj_apy_7d_avg'
                  ? priceLineColors.proj_apy_7d_avg
                  : priceLineColors.proj_apy_total_avg
            }
          />
        ))}
      </Stack>
      <ToggleButtonGroup
        exclusive
        value={activeTimeOption}
        onChange={setActiveTimeOption}
        sx={{ marginLeft: Spacing.md }}
      >
        {timeOptions.map((option) => (
          <ToggleButton value={option} key={option} size="extraSmall">
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  )
}
