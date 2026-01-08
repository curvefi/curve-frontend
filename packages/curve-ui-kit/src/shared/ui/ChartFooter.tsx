import { type MouseEvent } from 'react'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { t } from '@ui-kit/lib/i18n'
import { LegendSet, type LegendSetType } from '@ui-kit/shared/ui/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ChartFooterProps<T extends string> = {
  legendSets: LegendSetType[]
  showSoftLiquidationText?: boolean
  toggleOptions?: T[]
  activeToggleOption?: T
  onToggleChange?: (event: MouseEvent<HTMLElement>, newOption: T) => void
}

export const ChartFooter = <T extends string>({
  legendSets,
  showSoftLiquidationText = false,
  toggleOptions,
  activeToggleOption,
  onToggleChange,
}: ChartFooterProps<T>) => {
  const hasToggle = toggleOptions && toggleOptions.length > 0

  return (
    <Stack gap={Spacing.sm}>
      <Stack
        direction="row"
        alignItems="center"
        gap={Spacing.md}
        flexWrap="wrap"
        justifyContent={hasToggle ? 'space-between' : undefined}
      >
        <Stack direction="row" alignItems="center" gap={Spacing.sm} flexWrap="wrap">
          {legendSets.map((legendSet) => (
            <LegendSet key={legendSet.label} label={legendSet.label} line={legendSet.line} box={legendSet.box} />
          ))}
        </Stack>
        {hasToggle && (
          <ToggleButtonGroup exclusive value={activeToggleOption} onChange={onToggleChange}>
            {toggleOptions.map((option) => (
              <ToggleButton value={option} key={option} size="extraSmall">
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Stack>
      {showSoftLiquidationText && (
        <Typography variant="bodySRegular">
          {t`When the price enters the liquidation zone, health will start decreasing putting your position at risk. Repay debt to improve health or close your position to avoid liquidation.`}
        </Typography>
      )}
    </Stack>
  )
}
