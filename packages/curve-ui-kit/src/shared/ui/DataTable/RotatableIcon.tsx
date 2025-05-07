import type { SxProps, Theme } from '@mui/material'
import SvgIcon from '@mui/material/SvgIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

/** Allows an icon to be rotated with animations when rotated or getting hidden */
export const RotatableIcon = ({
  isEnabled = true,
  icon: Icon,
  rotated,
  fontSize,
  sx,
}: {
  rotated: boolean
  isEnabled?: boolean
  fontSize: number
  icon: typeof SvgIcon
  sx?: SxProps<Theme>
}) => (
  <Icon
    sx={{
      ...(rotated && { transform: `rotate(180deg)` }),
      verticalAlign: 'text-bottom',
      fontSize,
      transition: `transform ${TransitionFunction}, font-size ${TransitionFunction}`,
      visibility: isEnabled ? 'visible' : 'hidden', // render it invisible to avoid layout shift
      ...sx,
    }}
  />
)
