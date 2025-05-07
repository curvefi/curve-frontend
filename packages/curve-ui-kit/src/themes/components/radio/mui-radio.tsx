/// <reference path="./mui-radio.d.ts" />
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { Components } from '@mui/material/styles'
import { createSvgIcon } from '@mui/material/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../../basic-theme'

const { Sizing } = SizesAndSpaces

// Empty icon that will only show the border defined the root style
const EmptyIcon = createSvgIcon(<svg viewBox="0 0 24 24" />, 'Empty')

// Circle icon for the checked state of radio buttons
const CircleIcon = createSvgIcon(
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="6" fill="currentColor" />
  </svg>,
  'Circle',
)

const createIconWrapper = (icon: ReactNode) => (
  <Box
    className="icon-wrapper"
    display="flex"
    sx={{
      outline: '1px solid currentColor',
      borderRadius: '50%',

      // Animate the checkbox as it appears. It's not possible to animate it when unchecking.
      '& svg': {
        animation: 'circle-appear 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      '@keyframes circle-appear': {
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
 * 3. Radio buttons need more precise size control
 */
const buttonSize = ({ size }: { size: keyof typeof Sizing }) => ({
  '& .icon-wrapper svg': handleBreakpoints({ fontSize: Sizing[size] }),
})

const onHoverFocusOrLabelHover =
  '&:hover .icon-wrapper, .MuiFormControlLabel-root:hover &:not(.Mui-disabled) .icon-wrapper, &.Mui-focusVisible .icon-wrapper'

/**
 * Note: When a radio button is both checked and disabled, it uses the default MUI disabled color
 * for the inner circle rather than a desaturated version of its original color.
 *
 * This is a limitation as attempts to maintain the original color with reduced opacity
 * don't work well with custom color properties.
 */
export const defineMuiRadio = (): Components['MuiRadio'] => ({
  defaultProps: {
    icon: createIconWrapper(<EmptyIcon />),
    checkedIcon: createIconWrapper(<CircleIcon />),
    disableRipple: true,
  },
  styleOverrides: {
    root: {
      ...buttonSize({ size: 'sm' }),
      [onHoverFocusOrLabelHover]: { outlineWidth: '2px' },
    },

    sizeSmall: { ...buttonSize({ size: 'xs' }) },
    sizeLarge: { ...buttonSize({ size: 'md' }) },
  },
})
