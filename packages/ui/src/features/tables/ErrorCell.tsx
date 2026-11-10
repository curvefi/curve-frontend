import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ExclamationTriangleIcon } from '@ui/icons/ExclamationTriangleIcon'

const { IconSize } = SizesAndSpaces

export const ErrorCell = ({ error }: { error: Error }) => (
  <Tooltip title={error.toString()}>
    <ExclamationTriangleIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
  </Tooltip>
)
