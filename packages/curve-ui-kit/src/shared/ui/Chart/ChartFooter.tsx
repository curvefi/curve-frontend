import { type MouseEvent } from 'react'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { LegendSet, type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ChartFooterProps<T extends string> = {
  legendSets: LegendItem[]
  description?: string
  toggleOptions?: T[]
  activeToggleOption?: T
  onToggleChange?: (event: MouseEvent<HTMLElement>, newOption: T) => void
}

export const ChartFooter = <T extends string>({
  legendSets,
  description,
  toggleOptions,
  activeToggleOption,
  onToggleChange,
}: ChartFooterProps<T>) => {
  const hasToggle = !!toggleOptions?.length

  return (
    <Stack gap={Spacing.sm}>
      <Stack
        direction="row"
        alignItems="center"
        gap={Spacing.sm}
        flexWrap="wrap"
        justifyContent={hasToggle ? 'space-between' : undefined}
      >
        <Stack direction="row" alignItems="center" gap={Spacing.sm} flexWrap="wrap">
          {legendSets.map((legendSet) => (
            <LegendSet
              key={legendSet.label}
              label={legendSet.label}
              line={legendSet.line}
              box={legendSet.box}
              toggled={legendSet.toggled}
              onToggle={legendSet.onToggle}
            />
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
      {description && <Typography variant="bodyXsRegular" sx={{ maxWidth: '90ch', color: 'text.secondary' }}>{description}</Typography>}
    </Stack>
  )
}
