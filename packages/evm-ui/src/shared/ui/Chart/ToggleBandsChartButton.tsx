import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { EyeClosed } from '@ui-kit/shared/icons/EyeClosed'
import { EyeOpen } from '@ui-kit/shared/icons/EyeOpen'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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
