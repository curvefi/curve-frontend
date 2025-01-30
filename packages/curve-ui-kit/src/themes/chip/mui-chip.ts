import type { Components } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import { DesignSystem } from '@ui-kit/themes/design'
import { Grays } from '@ui-kit/themes/design/0_primitives'
import { TypographyVariantKey } from '@ui-kit/themes/typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { handleBreakpoints, Responsive } from '@ui-kit/themes/basic-theme'
import type { TypographyOptions } from '@mui/material/styles/createTypography'

const invert = (color: DesignSystem['Color']) => color.Neutral[50]

const { Sizing, IconSize } = SizesAndSpaces

type ChipSizeDefinition = { font: TypographyVariantKey; height: Responsive }

const chipSizes: Record<ChipProps['size'], ChipSizeDefinition> = {
  extraSmall: { font: 'bodyXsBold', height: IconSize.md },
  small: { font: 'buttonXs', height: IconSize.md },
  medium: { font: 'buttonXs', height: Sizing.md },
  large: { font: 'headingSBold', height: Sizing.md },
  extraLarge: { font: 'buttonM', height: Sizing.xl },
}

// overrides for clickable chips
const chipSizeClickable: Record<ChipProps['size'], Partial<ChipSizeDefinition>> = {
  extraSmall: {},
  small: { height: Sizing.md },
  medium: { font: 'buttonS' },
  large: { height: Sizing.lg, font: 'buttonS' },
  extraLarge: { height: Sizing.xl },
}

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

    { props: { color: 'active' }, style: { backgroundColor: Color.Secondary[400], color: invert(Color) } },
    { props: { color: 'warning' }, style: { backgroundColor: Color.Tertiary[200] } },
    { props: { color: 'accent' }, style: { backgroundColor: Layer.Highlight.Fill, color: invert(Color) } },

    // chip colors taken from design system variables
    {
      props: { color: 'highlight' },
      style: {
        backgroundColor: invert(Color) || Chips.Current.Fill,
        color: Chips.Current.Label,
        borderColor: Chips.Current.Outline,
        '& .MuiChip-deleteIcon': {
          fill: Chips.Current.Label,
        },
      },
    },
    {
      props: { color: 'inactive' },
      style: {
        color: Chips.Default.Label,
        backgroundColor: Chips.Default.Fill,
        borderColor: Chips.Default.Stroke,
        '& .MuiChip-deleteIcon': {
          fill: Chips.Default.Label,
        },
      },
    },

    // this is the "hover" state for chips in the design system
    {
      props: { clickable: true },
      style: {
        borderRadius: Chips.BorderRadius.Clickable,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: Chips.Hover.Fill,
          color: Chips.Hover.Label,
          '& .MuiChip-deleteIcon': {
            // stroke: Chips.Hover.Label,
            fill: Chips.Hover.Label,
          },
        },
      },
    },

    ...Object.entries(chipSizes).map(([size, { font, height }]) => ({
      props: { size: size as ChipProps['size'] },
      style: {
        ...typography[font],
        ...handleBreakpoints({ height }),
      },
    })),
    ...Object.entries(chipSizeClickable).map(([size, { font, height }]) => ({
      props: { size: size as ChipProps['size'], clickable: true },
      style: {
        ...(font && typography[font]),
        ...(height && handleBreakpoints({ height })),
      },
    })),
  ],
})
