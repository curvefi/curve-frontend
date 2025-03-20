import type { Components } from '@mui/material/styles'
import { createSvgIcon } from '@mui/material/utils'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../basic-theme'
import type { DesignSystem } from '../design'

const { Sizing } = SizesAndSpaces

/**
 * Using standard Sizing instead of ButtonSize because:
 * 1. ButtonSize is not responsive
 * 2. ButtonSize has larger gaps between size levels
 * 3. Checkbox buttons need more precise size control
 */
const buttonSize = ({ size }: { size: keyof typeof Sizing }) => ({
  '& .MuiSvgIcon-root': handleBreakpoints({ fontSize: Sizing[size] }),
})

// Empty icon that will only show the border defined the root style
const EmptyIcon = createSvgIcon(<svg viewBox="0 0 24 24" />, 'Empty')

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
    icon: <EmptyIcon />,
    checkedIcon: <CheckIcon />,
  },
  styleOverrides: {
    root: {
      ...buttonSize({ size: 'sm' }),
      '& .MuiSvgIcon-root': { outline: '1px solid currentColor' },
    },

    sizeSmall: { ...buttonSize({ size: 'xs' }) },
    sizeLarge: { ...buttonSize({ size: 'md' }) },
  },
})
