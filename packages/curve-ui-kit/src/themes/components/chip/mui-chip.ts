/// <reference types="./mui-chip.d.ts" />
import type { Components } from '@mui/material'
// eslint-disable-next-line no-restricted-imports
import type { ChipProps } from '@mui/material/Chip'
import type { CSSObject, TypographyVariantsOptions } from '@mui/material/styles'
import { mapRecord, recordValues } from '@primitives/objects.utils'
import { fixedResponsive, handleBreakpoints, Responsive } from '@ui-kit/themes/basic-theme'
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

const { Sizing, Spacing, IconSize, LineHeight, ButtonSize } = SizesAndSpaces

type ChipSizeDefinition = {
  font: TypographyVariantKey
  height: Responsive
  iconSize: Responsive
  paddingInline: Responsive
  lineHeight: Responsive
}
type ChipSizes = NonNullable<ChipProps['size']>
type ClickableChipVariant = NonNullable<ChipProps['variant']>
type ClickableChipColor = Extract<NonNullable<ChipProps['color']>, 'selected' | 'unselected'>

// Builds the shared color style for clickable chips
const clickableChipColorStyle = (color: string, backgroundColor: string, borderColor = 'transparent'): CSSObject => ({
  color,
  backgroundColor,
  borderColor,
  '& .MuiChip-icon': {
    color,
  },
  '& .MuiChip-deleteIcon': {
    color,
  },
})

// Returns the base and per-color styles for each clickable chip variant
const buildClickableChipVariantStyle = ({
  TextColors,
  Chips,
}: {
  TextColors: DesignSystem['Text']['TextColors']
  Chips: DesignSystem['Chips']
}) => {
  const outlined = {
    variant: undefined,
    base: clickableChipColorStyle(TextColors.Primary, 'transparent', Chips.Default.Stroke),
    colors: {
      selected: clickableChipColorStyle(Chips.Current.Label, Chips.Current.Fill, Chips.Current.Outline),
      unselected: clickableChipColorStyle(Chips.Default.Label, Chips.Default.Fill, Chips.Default.Stroke),
    },
  } as const
  const variants: Record<ClickableChipVariant, { base: CSSObject; colors: Record<ClickableChipColor, CSSObject> }> = {
    ghost: {
      base: clickableChipColorStyle(TextColors.Primary, 'transparent'),
      colors: {
        selected: clickableChipColorStyle(Chips.Current.Label, Chips.Current.Fill),
        unselected: clickableChipColorStyle(Chips.Default.Label, 'transparent'),
      },
    },
  }

  return [outlined, ...recordValues(mapRecord(variants, (variant, style) => ({ variant, ...style })))]
}

const chipSizes: Record<ChipSizes, ChipSizeDefinition> = {
  extraSmall: {
    font: 'bodyXsBold',
    height: Sizing.xs,
    iconSize: IconSize.xs,
    paddingInline: Spacing.xs,
    lineHeight: LineHeight.xs,
  },
  small: {
    font: 'buttonXs',
    height: IconSize.md,
    iconSize: IconSize.sm,
    paddingInline: Spacing.xs,
    lineHeight: LineHeight.xs,
  },
  medium: {
    font: 'buttonXs',
    height: Sizing.md,
    iconSize: IconSize.md,
    paddingInline: Spacing.sm,
    lineHeight: LineHeight.xs,
  },
  large: {
    font: 'buttonM',
    height: Sizing.md,
    iconSize: IconSize.md,
    paddingInline: Spacing.md,
    lineHeight: LineHeight.sm,
  },
  extraLarge: {
    font: 'headingSBold',
    height: Sizing.xl,
    iconSize: IconSize.xl,
    paddingInline: Spacing.md,
    lineHeight: LineHeight.md,
  },
}

// overrides for clickable chips
export const chipSizeClickable: Record<
  ChipSizes,
  ChipSizeDefinition & { deleteIconSize: Responsive; paddingBlock?: Responsive }
> = {
  extraSmall: {
    font: 'buttonXxs',
    height: fixedResponsive(ButtonSize.xxs),
    iconSize: IconSize.xs,
    paddingInline: Spacing.xs,
    lineHeight: LineHeight.xs,
    deleteIconSize: IconSize.xs,
  },
  small: {
    font: 'buttonXs',
    height: fixedResponsive(ButtonSize.xs),
    iconSize: IconSize.sm,
    paddingInline: Spacing.sm,
    paddingBlock: Spacing.xs,
    lineHeight: LineHeight.xs,
    deleteIconSize: IconSize.xs,
  },
  medium: {
    font: 'buttonS',
    height: fixedResponsive(ButtonSize.sm),
    iconSize: IconSize.md,
    paddingInline: Spacing.sm,
    paddingBlock: Spacing.xs,
    lineHeight: LineHeight.md,
    deleteIconSize: IconSize.sm,
  },
  large: {
    font: 'buttonS',
    height: fixedResponsive(ButtonSize.md),
    iconSize: IconSize.md,
    paddingInline: Spacing.sm,
    paddingBlock: Spacing.xs,
    lineHeight: LineHeight.md,
    deleteIconSize: IconSize.sm,
  },
  extraLarge: {
    font: 'buttonM',
    height: fixedResponsive(ButtonSize.md),
    iconSize: IconSize.lg,
    paddingInline: Spacing.sm,
    paddingBlock: Spacing.xs,
    lineHeight: LineHeight.md,
    deleteIconSize: IconSize.sm,
  },
}

/**
 * Defines the MuiChip component.
 * In Figma we have two different components "Badge" and "Chip" that are implemented here.
 * - Figma's Badge component is the non-clickable MuiChip. MuiBadge is attached to another component, so it cannot be used.
 * - As we share colors between components, Figma's Chip active color is implemented as "selected" color. inactive is "unselected"
 * - clickable chips use the variant prop to switch between outlined and ghost styles.
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
      '&:has(.MuiChip-icon), &:has(.MuiChip-deleteIcon)': {
        ...handleBreakpoints({ gap: Spacing.xs }),
        '& .MuiChip-icon': { marginInline: 0 },
        '& .MuiChip-deleteIcon': { marginInline: 0 },
      },
      // Mui has default paddings set this to 12px, override with our custom paddingInline per size
      '& .MuiChip-label': {
        paddingLeft: 'unset',
        paddingRight: 'unset',
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
        cursor: 'pointer',
        '&:has(.MuiChip-icon), &:has(.MuiChip-deleteIcon)': {
          ...handleBreakpoints({ gap: Spacing.xxs }),
        },
        '& .MuiChip-icon': { marginInline: 0, color: 'inherit' },
        '& .MuiChip-deleteIcon': { margin: 0, color: 'inherit' },
        '&:hover, &:focus-visible': {
          borderColor: 'transparent',
          backgroundColor: Chips.Hover.Fill,
          color: Chips.Hover.Label,
          '& .MuiChip-icon': {
            color: Chips.Hover.Label,
          },
          '& .MuiChip-deleteIcon': {
            color: Chips.Hover.Label,
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

    ...buildClickableChipVariantStyle({ TextColors, Chips }).flatMap(({ variant, base, colors }) => [
      {
        props: { clickable: true, variant },
        style: base,
      },
      ...Object.entries(colors).map(([color, style]) => ({
        props: { clickable: true, variant, color },
        style,
      })),
    ]),

    ...Object.entries(chipSizes).map(([size, { font, iconSize, height, paddingInline, lineHeight }]) => ({
      props: { size: size as ChipSizes },
      style: {
        ...handleBreakpoints({ ...typography[font], paddingInline }),
        height: height.desktop, // constant height for all breakpoints
        '& .MuiChip-icon': handleBreakpoints({ width: iconSize.desktop, height: iconSize.desktop }),
        '& .MuiChip-label': handleBreakpoints({ lineHeight }),
        // Target chips with empty labels (icon-only chips)
        '&:has(.MuiChip-label:empty)': {
          width: height.desktop, // constant width for icon-only chips (perfect square)
          height: height.desktop,
        },
      },
    })),
    ...Object.entries(chipSizeClickable).map(
      ([size, { font, deleteIconSize, height: heightOverride, iconSize, ...rest }]) => ({
        props: {
          size: size as ChipSizes,
          clickable: true,
        },
        style: {
          ...handleBreakpoints({ ...(font && typography[font]), ...rest }),
          ...(heightOverride && {
            height: heightOverride.desktop, // constant height override for clickable chips
            '& .MuiChip-icon': handleBreakpoints({ width: iconSize.desktop, height: iconSize.desktop }),
            // Target clickable chips with empty labels (icon-only chips)
            '&:has(.MuiChip-label:empty)': {
              width: heightOverride.desktop, // constant width for icon-only clickable chips (perfect square)
              height: heightOverride.desktop,
            },
          }),
          '& .MuiChip-deleteIcon': handleBreakpoints({ width: deleteIconSize, height: deleteIconSize }),
        },
      }),
    ),
  ],
})
