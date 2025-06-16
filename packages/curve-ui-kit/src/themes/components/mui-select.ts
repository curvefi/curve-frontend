import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { Components } from '@mui/material/styles'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { DesignSystem } from '@ui-kit/themes/design'
import { handleBreakpoints } from '../basic-theme'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

const { Spacing, Sizing, IconSize } = SizesAndSpaces

const ICON_SIZE = IconSize.lg

export const defineMuiSelect = (design: DesignSystem, typography: TypographyOptions): Components['MuiSelect'] => ({
  defaultProps: {
    IconComponent: KeyboardArrowDownIcon,
  },
  styleOverrides: {
    root: {
      border: 'none',
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        borderBottom: `1px solid ${design.Layer[3].Outline}`,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `2px solid ${design.Inputs.Base.Default.Border.Active}`,
      },
    },
    select: {
      // By default, the select doesn't vertically align items, which looks off as we make the height responsive.
      display: 'flex',
      alignItems: 'center',
      ...typography.bodyMBold,
      ...handleBreakpoints({
        paddingBlock: Spacing.xs,
        paddingInlineStart: Spacing.sm,
        height: Sizing.xl,
        /**
         * The overflow hiding doesn't take into account the expansion chevron icon, so we need to deduct
         * the icon width from the available text space (100% by default).
         * Initially attempted to reduce the `width` property, but this also reduces the clickable area
         * for opening the options menu. Instead, maintain 100% width but mask the right side using
         * the responsive icon size to prevent text overlap with the chevron.
         * Implementation uses a CSS mask with a linear gradient from opaque to transparent.
         */
        '--icon-size': ICON_SIZE,
        mask: 'linear-gradient(to right, black calc(100% - var(--icon-size)), transparent calc(100% - var(--icon-size)))',
      }),
    },
    icon: {
      // Not sure if there's a better way, and I don't want to use our custom TransitionFunction as it doesn't match
      // the animation the MUI select option list uses when expanding.
      // Use hardcoded transition values instead of MUI's theme function, which isn't accessible here.
      transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1)',
      ...handleBreakpoints({
        width: ICON_SIZE,
        height: ICON_SIZE,
        // MUI default of `calc(50% - .5em)` doesn't really vertically center correctly given our responsive icon size
        '--icon-size': ICON_SIZE,
        top: '50%',
        // Offset half the height from the 50% top. Don't use transform to keep rotation animation
        translate: '0 calc(var(--icon-size) / -2)',
      }),
      right: 0, // Remove MUI default of 7px
    },
  },
})
