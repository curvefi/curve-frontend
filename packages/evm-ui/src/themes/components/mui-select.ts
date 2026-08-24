/// <reference types="./mui-select.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { recordEntries } from '@primitives/objects.utils'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import type { SelectProps } from '@ui-kit/shared/ui/Select'
import { DesignSystem } from '@ui-kit/themes/design'
import { handleBreakpoints, mapBreakpoints, type Responsive } from '../basic-theme'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

const { IconSize, SelectSize, SelectSpacing } = SizesAndSpaces

type SelectSizeDefinition = {
  height: string
  iconSize: Responsive
  iconPaddingRight: string
  paddingBlock: string
  paddingInlineStart: string
  typography: 'bodySBold' | 'bodyMBold' | 'headingSBold'
}

type SelectSizes = NonNullable<SelectProps['size']>

const getSelectIconSpace = (iconSize: Responsive, iconPaddingRight: string): Responsive<string> =>
  mapBreakpoints(iconSize, size => `calc(${size} + ${SelectSpacing.IconGap} + ${iconPaddingRight})`) as Responsive

const selectSize = (size: SelectSizes, typography: SelectSizeDefinition['typography']): SelectSizeDefinition => ({
  height: SelectSize[size],
  iconSize: size === 'tiny' ? IconSize.md : IconSize.lg,
  iconPaddingRight: SelectSpacing.IconPaddingRight[size],
  paddingBlock: SelectSpacing.ContentPaddingY[size],
  paddingInlineStart: SelectSpacing.PaddingX[size],
  typography,
})

const selectSizes: Record<SelectSizes, SelectSizeDefinition> = {
  tiny: selectSize('tiny', 'bodySBold'),
  small: selectSize('small', 'bodySBold'),
  medium: selectSize('medium', 'bodyMBold'),
  extraLarge: selectSize('extraLarge', 'headingSBold'),
}

export const defineMuiSelect = (
  design: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiSelect'] => ({
  defaultProps: {
    IconComponent: ChevronDownIcon,
  },
  styleOverrides: {
    root: {
      border: 'none',
      color: design.Select.Text.Value,
      '& .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${design.InputSelect.Base.Default.Border.Default}`,
      },
      '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled)': {
        backgroundColor: design.InputSelect.Base.Default.Fill.Hover,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: design.InputSelect.Base.Default.Border.Hover,
        },
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `2px solid ${design.InputSelect.Base.Default.Border.Active}`,
      },
      '&.Mui-error': {
        color: design.Select.Text.Error,
        '& .MuiOutlinedInput-notchedOutline': {
          border: `2px solid ${design.InputSelect.Base.Default.Border.Error}`,
        },
      },
      '&.Mui-disabled': {
        color: design.Select.Text.Disabled,
      },
    },
    select: {
      // By default, the select doesn't vertically align items, which looks off as we make the height responsive.
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
    },
    icon: {
      // Not sure if there's a better way, and I don't want to use our custom TRANSITION_FUNCTION as it doesn't match
      // the animation the MUI select option list uses when expanding.
      // Use hardcoded transition values instead of MUI's theme function, which isn't accessible here.
      color: design.Select.Text.Value,
      transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1)',
      '.Mui-disabled &': {
        color: design.Select.Text.Disabled,
      },
    },
  },
  variants: [
    ...recordEntries(selectSizes).map(
      ([size, { height, iconSize, iconPaddingRight, paddingBlock, paddingInlineStart, typography: font }]) => {
        const iconSpace = getSelectIconSpace(iconSize, iconPaddingRight)

        return {
          props: { size },
          style: {
            // Override InputBase height at root level and desktop size across all breakpoints.
            '&.MuiInputBase-root': { height },
            '&& .MuiSelect-select.MuiSelect-select': {
              // Remove MUI's inline margin.
              marginInline: 0,
              height,
              ...typography[font],
              ...handleBreakpoints({
                paddingBlock,
                paddingInlineStart,
                paddingRight: iconSpace,
                /**
                 * The overflow hiding doesn't take into account the expansion chevron icon, so we need to deduct
                 * the icon width from the available text space (100% by default).
                 * Initially attempted to reduce the `width` property, but this also reduces the clickable area
                 * for opening the options menu. Instead, maintain 100% width but mask the right side using
                 * the responsive icon size to prevent text overlap with the chevron.
                 * Implementation uses a CSS mask with a linear gradient from opaque to transparent.
                 */
                '--icon-space': iconSpace,
                mask: 'linear-gradient(to right, black calc(100% - var(--icon-space)), transparent calc(100% - var(--icon-space)))',
              }),
            },
            '& .MuiSelect-icon': {
              ...handleBreakpoints({
                width: iconSize,
                height: iconSize,
                right: iconPaddingRight,
                // MUI default of `calc(50% - .5em)` doesn't really vertically center correctly given our responsive icon size
                '--icon-size': iconSize,
                top: '50%',
                // Offset half the height from the 50% top. Don't use transform to keep rotation animation
                translate: '0 calc(var(--icon-size) / -2)',
              }),
            },
          },
        }
      },
    ),
  ],
})
