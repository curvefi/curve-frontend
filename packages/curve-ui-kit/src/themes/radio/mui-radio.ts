import type { Components } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../basic-theme'
import type { DesignSystem } from '../design'

const { Sizing } = SizesAndSpaces

/**
 * Using standard Sizing instead of ButtonSize because:
 * 1. ButtonSize is not responsive
 * 2. ButtonSize has larger gaps between size levels
 * 3. Radio buttons need more precise size control
 */
const buttonSize = ({ size }: { size: keyof typeof Sizing }) => ({
  '& .MuiSvgIcon-root': handleBreakpoints({ fontSize: Sizing[size] }),
})

/**
 * Note: When a radio button is both checked and disabled, it uses the default MUI disabled color
 * for the inner circle rather than a desaturated version of its original color.
 *
 * This is a limitation as attempts to maintain the original color with reduced opacity
 * don't work well with custom color properties.
 */
export const defineMuiRadio = (design: DesignSystem): Components['MuiRadio'] => ({
  styleOverrides: {
    root: { ...buttonSize({ size: 'sm' }) },

    sizeSmall: { ...buttonSize({ size: 'xs' }) },
    sizeLarge: { ...buttonSize({ size: 'md' }) },
  },
})
