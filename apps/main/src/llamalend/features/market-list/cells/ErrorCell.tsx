import { ExclamationTriangleIcon } from '@evm-ui/shared/icons/ExclamationTriangleIcon'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

export const ErrorCell = ({ error }: { error: Error }) => (
  <Tooltip title={error.toString()}>
    <ExclamationTriangleIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
  </Tooltip>
)
