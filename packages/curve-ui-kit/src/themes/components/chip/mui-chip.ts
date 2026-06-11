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

const { Spacing, IconSize, LineHeight, ButtonSize, Badge } = SizesAndSpaces

type ChipSizeDefinition = {
  font: TypographyVariantKey
  height: Responsive
  iconSize: Responsive
  paddingInline: Responsive
  lineHeight: Responsive
}
type BadgeSizeDefinition = {
  font: TypographyVariantKey
  height: string
  iconSize: Responsive
  paddingX: Responsive
  paddingY: Responsive
  iconGap: Responsive
  lineHeight: Responsive
}
type ChipSizes = NonNullable<ChipProps['size']>
type ChipVariantProps = Partial<ChipProps> & { ownerState: Partial<ChipProps> }
type ClickableChipVariant = NonNullable<ChipProps['variant']>
type ClickableChipColor = Extract<NonNullable<ChipProps['color']>, 'selected' | 'unselected'>
const isBadgeVariant = ({ ownerState }: ChipVariantProps) => !ownerState.clickable

const createColor = (
  color: keyof DesignSystem['Badges']['Fill'],
  Badges: DesignSystem['Badges'],
  borderWidth: CSSObject['borderWidth'] = Badge.BorderWidth,
) => ({
  style: {
    backgroundColor: Badges.Fill[color],
    color: Badges.Label[color],
    borderColor: Badges.Border[color],
    borderWidth,
  },
  props: (props: ChipVariantProps) => isBadgeVariant(props) && props.ownerState.color === color.toLowerCase(),
})

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

const badgeSizes: Record<ChipSizes, BadgeSizeDefinition> = {
  extraSmall: {
    font: 'bodyXsBold',
    height: Badge.Size.extraSmall,
    iconSize: Badge.IconSize.extraSmall,
    paddingX: Badge.Padding.extraSmall.x,
    paddingY: Badge.Padding.extraSmall.y,
    iconGap: Badge.Gap.extraSmall,
    lineHeight: Badge.LineHeight.extraSmall,
  },
  small: {
    font: 'buttonXs',
    height: Badge.Size.small,
    iconSize: Badge.IconSize.small,
    paddingX: Badge.Padding.small.x,
    paddingY: Badge.Padding.small.y,
    iconGap: Badge.Gap.small,
    lineHeight: Badge.LineHeight.small,
  },
  medium: {
    font: 'buttonXs',
    height: Badge.Size.medium,
    iconSize: Badge.IconSize.medium,
    paddingX: Badge.Padding.medium.x,
    paddingY: Badge.Padding.medium.y,
    iconGap: Badge.Gap.medium,
    lineHeight: Badge.LineHeight.medium,
  },
  large: {
    font: 'buttonM',
    height: Badge.Size.large,
    iconSize: Badge.IconSize.large,
    paddingX: Badge.Padding.large.x,
    paddingY: Badge.Padding.large.y,
    iconGap: Badge.Gap.large,
    lineHeight: Badge.LineHeight.large,
  },
  extraLarge: {
    font: 'headingSBold',
    height: Badge.Size.extraLarge,
    iconSize: Badge.IconSize.extraLarge,
    paddingX: Badge.Padding.extraLarge.x,
    paddingY: Badge.Padding.extraLarge.y,
    iconGap: Badge.Gap.extraLarge,
    lineHeight: Badge.LineHeight.extraLarge,
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
      borderWidth: Badge.BorderWidth,
      borderColor: 'transparent',
      borderRadius: Badges.Radius,
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

    // Badge colors mirror Figma's Badges/LabelIcon tokens while keeping the runtime key as Badges.Label.
    createColor('Default', Badges),
    createColor('Active', Badges, 0),
    createColor('Alert', Badges, 0),
    createColor('Highlight', Badges),
    createColor('Warning', Badges, 0),
    createColor('Accent', Badges, 0),

    ...buildClickableChipVariantStyle({ TextColors, Chips }).flatMap(({ variant, base, colors }) => [
      {
        props: { clickable: true, variant },
        style: base,
      },
      ...Object.entries(colors).map(([color, style]) => ({ props: { clickable: true, variant, color }, style })),
    ]),

    ...Object.entries(badgeSizes).map(
      ([size, { font, height, iconSize, paddingX, paddingY, iconGap, lineHeight }]) => ({
        props: (props: ChipVariantProps) => isBadgeVariant(props) && props.ownerState.size === size,
        style: {
          ...typography[font],
          ...handleBreakpoints({ paddingInline: paddingX, paddingBlock: paddingY }),
          height,
          '& .MuiChip-icon': handleBreakpoints({ width: iconSize, height: iconSize }),
          '& .MuiChip-label': handleBreakpoints({ lineHeight }),
          '&:has(.MuiChip-icon)': {
            ...handleBreakpoints({
              gap: iconGap,
            }),
          },
          // Target chips with empty labels (icon-only badges)
          '&:has(.MuiChip-label:empty)': {
            width: height, // constant width for icon-only badges (perfect square)
            height,
            gap: 0,
            padding: 0,
            justifyContent: 'center',
          },
        },
      }),
    ),
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
