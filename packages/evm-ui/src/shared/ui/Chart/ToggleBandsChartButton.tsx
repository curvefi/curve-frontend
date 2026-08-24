import type { ReactNode } from 'react'
import { EyeClosed } from '@evm-ui/shared/icons/EyeClosed'
import { EyeOpen } from '@evm-ui/shared/icons/EyeOpen'
import { SelectableChip } from '@evm-ui/shared/ui/SelectableChip'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'

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
