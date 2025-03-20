import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { Components } from '@mui/material/styles'
import { createSvgIcon } from '@mui/material/utils'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../basic-theme'
import type { DesignSystem } from '../design'

const { Sizing } = SizesAndSpaces

// Empty icon that will only show the border defined the root style
const EmptyIcon = createSvgIcon(<svg viewBox="0 0 24 24" />, 'Empty')

const createIconWrapper = (icon: ReactNode) => (
  <Box
    className="icon-wrapper"
    display="flex"
    sx={{
      outline: '1px solid currentColor',

      // Animate the checkbox as it appears. It's not possible to animate it when unchecking.
      '& svg': {
        animation: 'checkmark-appear 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      '@keyframes checkmark-appear': {
        from: {
          transform: 'scale(0)',
        },
        to: {
          transform: 'scale(1)',
        },
      },
    }}
  >
    {icon}
  </Box>
)

/**
 * Using standard Sizing instead of ButtonSize because:
 * 1. ButtonSize is not responsive
 * 2. ButtonSize has larger gaps between size levels
 * 3. Checkbox buttons need more precise size control
 */
const buttonSize = ({ size }: { size: keyof typeof Sizing }) => ({
  '& .icon-wrapper svg': handleBreakpoints({ fontSize: Sizing[size] }),
})

/**
 * Checkbox sizes are slightly larger than in Figma to match radio button sizes
 * for better usability in practice.
 *
 * The default MUI icons are replaced with custom ones. Unlike MUI's default where
 * the checkbox background is filled with color and the checkmark is white, our design
 * keeps the checkbox fill transparent while coloring the checkmark and outline.
 *
 * Note: For checked and disabled checkboxes, we use MUI's default disabled color
 * as custom color properties with reduced opacity don't render consistently.
 *
 * This is a limitation as attempts to maintain the original color with reduced opacity
 * don't work well with custom color properties.
 */
export const defineMuiCheckbox = (design: DesignSystem): Components['MuiCheckbox'] => ({
  defaultProps: {
    icon: createIconWrapper(<EmptyIcon />),
    checkedIcon: createIconWrapper(<CheckIcon />),
    disableRipple: true,
  },
  styleOverrides: {
    root: {
      ...buttonSize({ size: 'sm' }),
      '&:hover .icon-wrapper': { outlineWidth: '2px' },
    },

    sizeSmall: { ...buttonSize({ size: 'xs' }) },
    sizeLarge: { ...buttonSize({ size: 'md' }) },
  },
})
