import Tooltip from '@mui/material/Tooltip'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

export const ErrorCell = ({ error }: { error: Error }) => (
  <Tooltip title={error.toString()}>
    <ExclamationTriangleIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
  </Tooltip>
)
