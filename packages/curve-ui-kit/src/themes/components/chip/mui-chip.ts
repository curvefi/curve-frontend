/// <reference types="./mui-chip.d.ts" />
import type { Components } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip/Chip'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
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

// note: the design system is using inverted themes for this color, there is no semantic colors for the clickable chips.
const invertPrimary = (color: DesignSystem['Color']) => color.Neutral[50]

const { Sizing, Spacing, IconSize } = SizesAndSpaces

type ChipSizeDefinition = {
  font: TypographyVariantKey
  height: Responsive
  iconSize: Responsive
}

type ChipSizes = NonNullable<ChipProps['size']>

const chipSizes: Record<ChipSizes, ChipSizeDefinition> = {
  extraSmall: { font: 'bodyXsBold', height: IconSize.md, iconSize: IconSize.sm },
  small: { font: 'buttonXs', height: IconSize.md, iconSize: IconSize.sm },
  medium: { font: 'buttonXs', height: Sizing.md, iconSize: IconSize.md },
  large: { font: 'buttonM', height: Sizing.md, iconSize: IconSize.lg },
  extraLarge: { font: 'headingSBold', height: Sizing.xl, iconSize: IconSize.xl },
}

// overrides for clickable chips
const chipSizeClickable: Record<ChipSizes, Partial<ChipSizeDefinition> & { deleteIconSize: Responsive }> = {
  extraSmall: { deleteIconSize: IconSize.xs },
  small: { height: Sizing.md, deleteIconSize: IconSize.sm },
  medium: { font: 'buttonS', deleteIconSize: IconSize.md },
  large: { height: Sizing.lg, font: 'buttonS', deleteIconSize: IconSize.lg },
  extraLarge: { height: Sizing.xl, deleteIconSize: IconSize.xl },
}

/**
 * Defines the MuiChip component.
 * In Figma we have two different components "Badge" and "Chip" that are implemented here.
 * - Figma's Badge component is the non-clickable MuiChip. MuiBadge is attached to another component, so it cannot be used.
 * - As we share colors between components, Figma's Chip active color is implemented as "selected" color. inactive is "unselected"
 * - We do not use the "variant" prop (at the time of writing).
 */
export const defineMuiChip = (
  { Chips, Color, Text: { TextColors }, Layer, Badges }: DesignSystem,
  typography: TypographyOptions,
): Components['MuiChip'] => ({
  styleOverrides: {
    root: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: Chips.BorderRadius.NonClickable,
      color: TextColors.Primary,
      backgroundColor: 'transparent',
      ...handleBreakpoints({ paddingInline: Spacing.xs }),
      '&:has(.MuiChip-icon)': {
        ...handleBreakpoints({ gap: Spacing.xs }),
        '& .MuiChip-icon': { marginInline: 0 },
        '& .MuiChip-label': { paddingInline: 0 },
      },
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

    ...Object.entries(chipSizes).map(([size, { font, iconSize, ...rest }]) => ({
      props: { size: size as ChipSizes },
      style: {
        ...handleBreakpoints({ ...typography[font], ...rest }),
        '&:has(.MuiChip-icon)': {
          '& .MuiChip-icon': handleBreakpoints({ width: iconSize, height: iconSize }),
        },
      },
    })),
    ...Object.entries(chipSizeClickable).map(([size, { font, deleteIconSize, ...rest }]) => ({
      props: {
        size: size as ChipSizes,
        clickable: true,
      },
      style: {
        ...handleBreakpoints({ ...(font && typography[font]), ...rest }),
        '& .MuiChip-deleteIcon': handleBreakpoints({ width: deleteIconSize, height: deleteIconSize }),
      },
    })),
  ],
})
