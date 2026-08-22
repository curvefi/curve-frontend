import SvgIcon from '@mui/material/SvgIcon'
import { TRANSITION_FUNCTION } from '@ui-kit/themes/design/0_primitives'
import type { SxProps } from '@ui-kit/utils'

/** Allows an icon to be rotated with animations when rotated or getting hidden */
export const RotatableIcon = ({
  isEnabled = true,
  icon: Icon,
  rotated,
  fontSize,
  sx,
  testId,
}: {
  rotated: boolean
  isEnabled?: boolean
  fontSize: number
  icon: typeof SvgIcon
  sx?: SxProps
  testId?: string
}) => (
  <Icon
    sx={{
      ...(rotated && { transform: `rotate(180deg)` }),
      verticalAlign: 'text-bottom',
      fontSize,
      transition: `transform ${TRANSITION_FUNCTION}, font-size ${TRANSITION_FUNCTION}`,
      ...(!isEnabled && { visibility: 'hidden' }), // render it invisible to avoid layout shift
      ...sx,
    }}
    data-testid={testId}
  />
)
