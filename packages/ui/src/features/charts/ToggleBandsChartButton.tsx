import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SelectableChip } from '@ui/components/SelectableChip'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { EyeClosed } from '@ui/icons/EyeClosed'
import { EyeOpen } from '@ui/icons/EyeOpen'

const { Spacing } = SizesAndSpaces

export const ToggleBandsChartButton = ({
  label,
  isVisible,
  toggle,
  tooltip,
}: {
  label: string
  isVisible: boolean
  toggle: () => void
  tooltip?: ReactNode
}) => (
  <SelectableChip
    size="small"
    selected={isVisible}
    toggle={toggle}
    aria-pressed={isVisible}
    label={
      <WithWrapper Wrapper={Tooltip} title={tooltip} placement="top" shouldWrap={tooltip}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
          {isVisible ? <EyeOpen /> : <EyeClosed />}
          {label}
        </Stack>
      </WithWrapper>
    }
  />
)
