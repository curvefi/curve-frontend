/// <reference types="./mui-chip.d.ts" />
import { recordEntries } from '@curvefi/prices-api/objects.util'
import type { Components } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import type { TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints, Responsive } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'

const createColor = (color: keyof DesignSystem['Badges']['Fill'], Badges: DesignSystem['Badges']) => ({
  style: {
    backgroundColor: Badges.Fill[color],
    color: Badges.Label[color],
    borderColor: Badges.Border[color],
  },
  props: { color: color.toLowerCase() as ChipProps['color'] },
})

const { Sizing, Spacing, IconSize } = SizesAndSpaces

type ChipSizeDefinition = {
  font: TypographyVariantKey
  container: Responsive
  iconSize: Responsive
}

type ChipSizes = NonNullable<ChipProps['size']>

const chipSizes: Record<ChipSizes, ChipSizeDefinition> = {
  extraSmall: { font: 'bodyXsBold', container: IconSize.sm, iconSize: IconSize.sm },
  small: { font: 'buttonXs', container: IconSize.md, iconSize: IconSize.sm },
  medium: { font: 'buttonXs', container: Sizing.md, iconSize: IconSize.md },
  large: { font: 'buttonM', container: Sizing.md, iconSize: IconSize.lg },
  extraLarge: { font: 'headingSBold', container: Sizing.xl, iconSize: IconSize.xl },
}

// overrides for clickable chips
const chipSizeClickable: Record<ChipSizes, Partial<ChipSizeDefinition> & { deleteIconSize: Responsive }> = {
  extraSmall: { deleteIconSize: IconSize.xs },
  small: { container: Sizing.md, deleteIconSize: IconSize.sm },
  medium: { font: 'buttonS', deleteIconSize: IconSize.md },
  large: { container: Sizing.lg, font: 'buttonS', deleteIconSize: IconSize.lg },
  extraLarge: { container: Sizing.xl, deleteIconSize: IconSize.xl },
}

/**
 * Defines the MuiChip component.
 * In Figma we have two different components "Badge" and "Chip" that are implemented here.
 * - Figma's Badge component is the non-clickable MuiChip. MuiBadge is attached to another component, so it cannot be used.
 * - As we share colors between components, Figma's Chip active color is implemented as "selected" color. inactive is "unselected"
 * - We do not use the "variant" prop (at the time of writing).
 */
export const defineMuiChip = (
  { Chips, Text: { TextColors }, Badges }: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiChip'] => ({
  styleOverrides: {
    root: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: Chips.BorderRadius.NonClickable,
      color: TextColors.Primary,
      backgroundColor: 'transparent',
      ...handleBreakpoints({ paddingInline: Spacing.xxs }),
      '&:has(.MuiChip-icon)': {
        ...handleBreakpoints({ gap: Spacing.xs }),
        '& .MuiChip-icon': { marginInline: 0 },
        '& .MuiChip-label': {
          paddingInlineStart: 0,
          paddingInlineEnd: Spacing.xs.desktop,
        },
      },
      '& .MuiChip-label:empty': { display: 'none' },
    },
  },
  variants: [
    // 'clickable' is the "Chip" in the design system. This needs to be before the colors, so they may be overridden.
    {
      props: { clickable: true },
      style: {
        borderRadius: Chips.BorderRadius.Clickable,
        borderColor: Chips.Default.Stroke,
        cursor: 'pointer',
        '& .MuiChip-deleteIcon': { margin: 0 },
        '&:hover, &:focus-visible': {
          borderColor: 'transparent',
          backgroundColor: Chips.Hover.Fill,
          color: Chips.Hover.Label,
          '& .MuiChip-deleteIcon': {
            fill: Chips.Hover.Label,
          },
        },
      },
    },

    // 'badge' colors not in design system but defined directly in components
    createColor('Default', Badges),
    createColor('Active', Badges),
    createColor('Alert', Badges),
    createColor('Highlight', Badges),
    createColor('Warning', Badges),
    createColor('Accent', Badges),

    // chip colors taken from design system variables
    {
      props: { color: 'selected' },
      style: {
        backgroundColor: Chips.Current.Fill,
        color: Chips.Current.Label,
        borderColor: Chips.Current.Outline,
        '& .MuiChip-deleteIcon': {
          fill: Chips.Current.Label,
        },
      },
    },
    {
      props: { color: 'unselected' },
      style: {
        color: Chips.Default.Label,
        backgroundColor: Chips.Default.Fill,
        borderColor: Chips.Default.Stroke,
        '& .MuiChip-deleteIcon': {
          fill: Chips.Default.Label,
        },
      },
    },

    ...recordEntries(chipSizes).map(([size, { font, container, iconSize, ...rest }]) => ({
      props: { size },
      style: {
        ...handleBreakpoints({ ...typography[font], width: container, height: container, ...rest }),
        '&:has(.MuiChip-icon)': {
          '& .MuiChip-icon': handleBreakpoints({ width: iconSize, height: iconSize, lineHeight: iconSize }),
        },
      },
    })),
    ...recordEntries(chipSizeClickable).map(([size, { font, container, deleteIconSize, ...rest }]) => ({
      props: { size, clickable: true },
      style: {
        ...handleBreakpoints({
          ...(font && typography[font]),
          ...(container && { width: container, height: container }),
          ...rest,
        }),
        '& .MuiChip-deleteIcon': handleBreakpoints({ width: deleteIconSize, height: deleteIconSize }),
      },
    })),
  ],
})
