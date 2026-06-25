import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { EyeClosed } from '@ui-kit/shared/icons/EyeClosed'
import { EyeOpen } from '@ui-kit/shared/icons/EyeOpen'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { SelectableChip } from '../SelectableChip'
import { Tooltip } from '../Tooltip'

const { Spacing } = SizesAndSpaces

export const ToggleBandsChartButton = (
  {
    label,
    isVisible,
    toggle,
    tooltip,
  }: {
    label: string
    isVisible: boolean
    toggle: () => void
    tooltip?: ReactNode
  }, // todo: refactor chip to button
) => (
  <Tooltip title={tooltip} placement="top">
    <span>
      <SelectableChip
        toggle={toggle}
        label={
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            {isVisible ? <EyeOpen /> : <EyeClosed />}
            {label}
          </Stack>
        }
        selected={false}
      />
    </span>
  </Tooltip>
)
