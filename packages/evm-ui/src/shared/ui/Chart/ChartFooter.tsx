import { type MouseEvent } from 'react'
import { LegendSet, type LegendItem } from '@evm-ui/shared/ui/Chart/LegendSet'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ChartFooterProps<T extends string> = {
  testId?: string
  legendSets: LegendItem[]
  description?: string
  toggleOptions?: readonly T[]
  activeToggleOption?: T
  onToggleChange?: (event: MouseEvent<HTMLElement>, newOption: T) => void
}

export const ChartFooter = <T extends string>({
  testId,
  legendSets,
  description,
  toggleOptions,
  activeToggleOption,
  onToggleChange,
}: ChartFooterProps<T>) => {
  const hasToggle = !!toggleOptions?.length

  return (
    <Stack data-testid={testId} sx={{ gap: Spacing.sm }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: Spacing.sm,
          flexWrap: 'wrap',
          justifyContent: hasToggle ? 'space-between' : undefined,
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {legendSets.map(props => (
            <LegendSet key={`chart-footer-${props.label}`} {...props} />
          ))}
        </Stack>
        {hasToggle && (
          <ToggleButtonGroup exclusive value={activeToggleOption} onChange={onToggleChange}>
            {toggleOptions.map(option => (
              <ToggleButton value={option} key={`chart-footer-toggle-${option}`} size="extraSmall">
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Stack>
      {description && (
        <Typography variant="bodyXsRegular" color="textTertiary">
          {description}
        </Typography>
      )}
    </Stack>
  )
}
