import type { Components } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip/Chip'
import { DesignSystem } from '@ui-kit/themes/design'
import { Grays } from '@ui-kit/themes/design/0_primitives'
import { TypographyVariantKey } from '@ui-kit/themes/typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints, Responsive } from '@ui-kit/themes/basic-theme'
import type { TypographyOptions } from '@mui/material/styles/createTypography'

// note: the design system is using inverted themes for this color, there is no semantic colors for the clickable chips.
const invertPrimary = (color: DesignSystem['Color']) => color.Neutral[50]

const { Sizing, Spacing, IconSize } = SizesAndSpaces

type ChipSizeDefinition = { font: TypographyVariantKey; height: Responsive }

type ChipSizes = NonNullable<ChipProps['size']>

const chipSizes: Record<ChipSizes, ChipSizeDefinition> = {
  extraSmall: { font: 'bodyXsBold', height: IconSize.md },
  small: { font: 'buttonXs', height: IconSize.md },
  medium: { font: 'buttonXs', height: Sizing.md },
  large: { font: 'headingSBold', height: Sizing.md },
  extraLarge: { font: 'buttonM', height: Sizing.xl },
}

// overrides for clickable chips
const chipSizeClickable: Record<ChipSizes, Partial<ChipSizeDefinition>> = {
  extraSmall: {},
  small: { height: Sizing.md },
  medium: { font: 'buttonS' },
  large: { height: Sizing.lg, font: 'buttonS' },
  extraLarge: { height: Sizing.xl },
}

/**
 * Defines the MuiChip component.
 * In Figma we have two different components "Badge" and "Chip" that are implemented here.
 * - Figma's Badge component is the non-clickable MuiChip. MuiBadge is attached to another component, so it cannot be used.
 * - As we share colors between components, Figma's Chip active color is implemented as "selected" color. inactive is "unselected"
 * - We do not use the "variant" prop (at the time of writing).
 */
export const defineMuiChip = (
  { Chips, Color, Text: { TextColors }, Layer }: DesignSystem,
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
    },
  },
  variants: [
    // 'badge' colors not in design system but defined directly in components
    {
      props: { color: 'alert' },
      style: { backgroundColor: Layer.Feedback.Error, color: Grays[50] },
    },
    {
      props: { color: 'default' },
      style: { borderColor: Layer[1].Outline },
    },

    { props: { color: 'active' }, style: { backgroundColor: Color.Secondary[400], color: invertPrimary(Color) } },
    { props: { color: 'warning' }, style: { backgroundColor: Color.Tertiary[200] } },
    { props: { color: 'accent' }, style: { backgroundColor: Layer.Highlight.Fill, color: invertPrimary(Color) } },
    {
      props: { color: 'highlight' },
      style: {
        borderColor: Layer.Highlight.Outline,
        color: TextColors.Highlight,
        backgroundColor: invertPrimary(Color),
      },
    },

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

    // 'clickable' is the "Chip" in the design system
    {
      props: { clickable: true },
      style: {
        borderRadius: Chips.BorderRadius.Clickable,
        cursor: 'pointer',
        '&:has(.MuiChip-icon)': { ...handleBreakpoints({ paddingInline: Spacing.sm }) },
        '&:hover': {
          backgroundColor: Chips.Hover.Fill,
          color: Chips.Hover.Label,
          '& .MuiChip-deleteIcon': {
            fill: Chips.Hover.Label,
          },
        },
      },
    },

    ...Object.entries(chipSizes).map(([size, { font, ...rest }]) => ({
      props: { size: size as ChipSizes },
      style: { ...typography[font], ...handleBreakpoints(rest) },
    })),
    ...Object.entries(chipSizeClickable).map(([size, { font, ...rest }]) => ({
      props: { size: size as ChipSizes, clickable: true },
      style: { ...(font && typography[font]), ...handleBreakpoints(rest) },
    })),
  ],
})
