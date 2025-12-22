import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { EyeClosed } from '@ui-kit/shared/icons/EyeClosed'
import { EyeOpen } from '@ui-kit/shared/icons/EyeOpen'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ToggleBandsChartButton = ({
  label,
  isVisible,
  onClick,
}: {
  label: string
  isVisible: boolean
  onClick: () => void
}) => (
  <Chip
    color="unselected"
    size="small"
    onClick={onClick}
    label={
      <Stack direction="row" alignItems="center" gap={Spacing.xs}>
        {isVisible ? <EyeOpen /> : <EyeClosed />}
        {label}
      </Stack>
    }
  />
)
