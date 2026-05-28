/// <reference types="./mui-select.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import type { SelectProps } from '@ui-kit/shared/ui/Select'
import { DesignSystem } from '@ui-kit/themes/design'
import { handleBreakpoints, type Responsive } from '../basic-theme'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

const { IconSize, SelectSize, SelectSpacing } = SizesAndSpaces

type ResponsiveOrStatic = Responsive | string

const getResponsiveValue = (value: ResponsiveOrStatic, breakpoint: keyof Responsive) =>
  typeof value === 'string' ? value : value[breakpoint]

const getSelectIconSpace = (iconSize: Responsive, iconPaddingRight: ResponsiveOrStatic): Responsive<string> => ({
  mobile: `calc(${iconSize.mobile} + ${SelectSpacing.IconGap} + ${getResponsiveValue(iconPaddingRight, 'mobile')})`,
  tablet: `calc(${iconSize.tablet} + ${SelectSpacing.IconGap} + ${getResponsiveValue(iconPaddingRight, 'tablet')})`,
  desktop: `calc(${iconSize.desktop} + ${SelectSpacing.IconGap} + ${getResponsiveValue(iconPaddingRight, 'desktop')})`,
})

type SelectSizeDefinition = {
  height: string
  iconSize: Responsive
  iconPaddingRight: ResponsiveOrStatic
  paddingBlock: ResponsiveOrStatic
  paddingInlineStart: ResponsiveOrStatic
  typography: 'bodySBold' | 'bodyMBold' | 'headingSBold'
}

type SelectSizes = NonNullable<SelectProps['size']>

const selectSizes: Record<SelectSizes, SelectSizeDefinition> = {
  tiny: {
    height: SelectSize.tiny,
    iconSize: IconSize.md,
    iconPaddingRight: SelectSpacing.IconPaddingRight.tiny,
    paddingBlock: SelectSpacing.ContentPaddingY.tiny,
    paddingInlineStart: SelectSpacing.PaddingX.tiny,
    typography: 'bodySBold',
  },
  small: {
    height: SelectSize.small,
    iconSize: IconSize.lg,
    iconPaddingRight: SelectSpacing.IconPaddingRight.small,
    paddingBlock: SelectSpacing.ContentPaddingY.small,
    paddingInlineStart: SelectSpacing.PaddingX.small,
    typography: 'bodySBold',
  },
  medium: {
    height: SelectSize.medium,
    iconSize: IconSize.lg,
    iconPaddingRight: SelectSpacing.IconPaddingRight.medium,
    paddingBlock: SelectSpacing.ContentPaddingY.medium,
    paddingInlineStart: SelectSpacing.PaddingX.medium,
    typography: 'bodyMBold',
  },
  large: {
    height: SelectSize.large,
    iconSize: IconSize.lg,
    iconPaddingRight: SelectSpacing.IconPaddingRight.large,
    paddingBlock: SelectSpacing.ContentPaddingY.large,
    paddingInlineStart: SelectSpacing.PaddingX.large,
    typography: 'headingSBold',
  },
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
      // Not sure if there's a better way, and I don't want to use our custom TransitionFunction as it doesn't match
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
    ...Object.entries(selectSizes).map(
      ([size, { height, iconSize, iconPaddingRight, paddingBlock, paddingInlineStart, typography: font }]) => {
        const iconSpace = getSelectIconSpace(iconSize, iconPaddingRight)

        return {
          props: { size: size as SelectSizes },
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
                paddingInlineEnd: iconSpace,
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
