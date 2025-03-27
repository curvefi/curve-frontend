import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

export const ErrorCell = ({ error }: { error: Error }) => (
  <Tooltip title={error.toString()}>
    <ExclamationTriangleIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
  </Tooltip>
)
