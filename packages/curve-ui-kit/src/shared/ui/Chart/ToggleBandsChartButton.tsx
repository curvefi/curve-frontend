import Stack from '@mui/material/Stack'
import { EyeClosed } from '@ui-kit/shared/icons/EyeClosed'
import { EyeOpen } from '@ui-kit/shared/icons/EyeOpen'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { SelectableChip } from '../SelectableChip'

const { Spacing } = SizesAndSpaces

export const ToggleBandsChartButton = ({
  label,
  isVisible,
  toggle,
}: {
  label: string
  isVisible: boolean
  toggle: () => void
}) => (
  // todo: refactor chip to button
  <SelectableChip
    toggle={toggle}
    label={
      <Stack direction="row" alignItems="center" gap={Spacing.xs}>
        {isVisible ? <EyeOpen /> : <EyeClosed />}
        {label}
      </Stack>
    }
    selected={false}
  />
)
