/// <reference types="./mui-select.d.ts" />
import type { SelectProps } from '@mui/material/Select'
import type { Components } from '@mui/material/styles'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { DesignSystem } from '@ui-kit/themes/design'
import { handleBreakpoints, type Responsive } from '../basic-theme'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

const { Spacing, Sizing, IconSize } = SizesAndSpaces

type SelectSizeDefinition = {
  height: Responsive
  iconSize: Responsive
  paddingBlock: Responsive
  paddingInlineStart: Responsive
}

type SelectSizes = NonNullable<SelectProps['size']>

const selectSizes: Record<SelectSizes, SelectSizeDefinition> = {
  tiny: {
    height: Sizing.sm,
    iconSize: IconSize.md,
    paddingBlock: Spacing.xxs,
    paddingInlineStart: Spacing.sm,
  },
  small: {
    height: Sizing.md,
    iconSize: IconSize.lg,
    paddingBlock: Spacing.xs,
    paddingInlineStart: Spacing.sm,
  },
  medium: {
    height: Sizing.lg,
    iconSize: IconSize.lg,
    paddingBlock: Spacing.xs,
    paddingInlineStart: Spacing.sm,
  },
}

export const defineMuiSelect = (design: DesignSystem): Components['MuiSelect'] => ({
  defaultProps: {
    IconComponent: ChevronDownIcon,
  },
  styleOverrides: {
    root: {
      border: 'none',
      '& .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${design.Layer[2].Outline}`,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `2px solid ${design.Inputs.Base.Default.Border.Active}`,
      },
    },
    select: {
      // By default, the select doesn't vertically align items, which looks off as we make the height responsive.
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      // Not sure if there's a better way, and I don't want to use our custom TransitionFunction as it doesn't match
      // the animation the MUI select option list uses when expanding.
      // Use hardcoded transition values instead of MUI's theme function, which isn't accessible here.
      color: design.Text.TextColors.Primary,
      transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1)',
      right: 0, // Remove MUI default of 7px
    },
  },
  variants: [
    ...Object.entries(selectSizes).map(([size, { height, iconSize, paddingBlock, paddingInlineStart }]) => ({
      props: { size: size as SelectSizes },
      style: {
        // Override InputBase height at root level and desktop size accross all breakpoints
        '&.MuiInputBase-root': { height: height.desktop },
        '& .MuiSelect-select': {
          ...handleBreakpoints({
            paddingBlock,
            paddingInlineStart,
            height,
            /**
             * The overflow hiding doesn't take into account the expansion chevron icon, so we need to deduct
             * the icon width from the available text space (100% by default).
             * Initially attempted to reduce the `width` property, but this also reduces the clickable area
             * for opening the options menu. Instead, maintain 100% width but mask the right side using
             * the responsive icon size to prevent text overlap with the chevron.
             * Implementation uses a CSS mask with a linear gradient from opaque to transparent.
             */
            '--icon-size': iconSize,
            mask: 'linear-gradient(to right, black calc(100% - var(--icon-size)), transparent calc(100% - var(--icon-size)))',
          }),
        },
        '& .MuiSelect-icon': {
          ...handleBreakpoints({
            width: iconSize,
            height: iconSize,
            // MUI default of `calc(50% - .5em)` doesn't really vertically center correctly given our responsive icon size
            '--icon-size': iconSize,
            top: '50%',
            // Offset half the height from the 50% top. Don't use transform to keep rotation animation
            translate: '0 calc(var(--icon-size) / -2)',
          }),
        },
      },
    })),
  ],
})
