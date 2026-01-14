import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { TypographyVariantKey } from '@ui-kit/themes/typography'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces

// css classes used by the TabSwitcher component
const contained = 'variant-contained' as const
const underlined = 'variant-underlined' as const
const overlined = 'variant-overlined' as const
const small = 'size-small' as const
const medium = 'size-medium' as const
const extraExtraLarge = 'size-extraExtraLarge' as const
export const TABS_VARIANT_CLASSES = { contained, underlined, overlined }
export const TABS_SIZES_CLASSES = { small, medium, extraExtraLarge }
export const HIDE_INACTIVE_BORDERS_CLASS = 'hide-inactive-borders' as const
export const TAB_SUFFIX_CLASS = 'tab-suffix' as const

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

type TabStyle = { Label?: string; Fill?: string; Outline?: string }
type TabVariant = { Inset?: string; Default: TabStyle; Hover: TabStyle; Current: TabStyle }
type SpacingKey = keyof typeof Spacing | string | number

export const TAB_TEXT_VARIANTS = {
  small: 'buttonXs',
  medium: 'buttonS',
  extraExtraLarge: 'headingMBold',
} as const satisfies Record<keyof typeof TABS_SIZES_CLASSES, TypographyVariantKey>

export const TAB_HEIGHT: Record<keyof typeof TABS_SIZES_CLASSES, string> = {
  small: ButtonSize.xs,
  medium: ButtonSize.sm,
  extraExtraLarge: ButtonSize.md,
}

const BORDER_SIZE = '2px' as const
const BORDER_SIZE_INACTIVE = '1px' as const
const BORDER_SIZE_LARGE = '4px' as const
const TAB_BOX_SIZING = 'border-box' as const
export const CONTAINED_TABS_MARGIN_RIGHT = 1

type TabSizeConfig = {
  className: string
  height: string
  inline: SpacingKey
}

const TAB_SIZE_CONFIG: Record<keyof typeof TABS_SIZES_CLASSES, TabSizeConfig> = {
  small: { className: small, height: TAB_HEIGHT.small, inline: 'sm' },
  medium: { className: medium, height: TAB_HEIGHT.medium, inline: 'sm' },
  extraExtraLarge: { className: extraExtraLarge, height: TAB_HEIGHT.extraExtraLarge, inline: 'md' },
}

/**
 * Using ::after pseudo-selector for borders instead of CSS border properties for:
 *
 * 1. Consistency with MUI tab indicator implementation (absolute positioning)
 *
 * 2. Absolute positioning matches Figma design and avoids box model complications:
 *    - Borders don't affect element dimensions
 *    - Handles varying border heights and paddings cleanly
 *
 * 3. Simpler state management:
 *    - No need for transparent border fallbacks
 *    - Works seamlessly for both underline/overline variants
 *
 * 4. The ::after element enables separate transitions for opacity and background-color:
 *    - Hover state can smoothly transition from transparent to outline color via opacity
 *    - Active state can instantly switch outline colors without transition
 *    - This solves the limitation where a single CSS property (like border-color)
 *      cannot have different transition behaviors for hover vs active states
 *    In other words, this allows you to transition the border on and off state while
 *    keeping color changes instantenously.
 */

export const defineMuiTab = ({ Tabs: { Transition }, Text }: DesignSystem): Components['MuiTab'] => ({
  styleOverrides: {
    root: {
      transition: Transition,
      position: 'relative',
      boxSizing: 'content-box',
      opacity: 1,
      whiteSpace: 'nowrap',
      minHeight: 0, // It's 48px by default in Mui
      minWidth: 0, // It's 90px by default in Mui, but we want it smaller
      maxWidth: 'none', // It's 360px by default in Mui, but that sometimes interferes when displaying fewer tabs than expected (dynamic tab list)
      '&::after': {
        content: '""',
        position: 'absolute',
        height: BORDER_SIZE,
        '.MuiTabs-vertical &': {
          height: '100%',
          width: BORDER_SIZE,
          left: 0,
          top: 0,
        },
      },
      [`& .${TAB_SUFFIX_CLASS}`]: {
        color: Text.TextColors.Tertiary,
      },
      [`&:hover .${TAB_SUFFIX_CLASS}`]: {
        color: 'inherit',
      },
      [`&.Mui-selected .${TAB_SUFFIX_CLASS}`]: {
        color: Text.TextColors.Secondary,
      },
    },
  },
})

const tabStyle = ({ Label, Fill, Outline }: TabStyle, inset?: string) => ({
  color: Label,
  backgroundColor: Fill,
  '::after': {
    backgroundColor: Outline ?? 'transparent',
    inset,
  },
})

const tabVariant = ({ Current, Default, Hover, Inset }: TabVariant) => ({
  ...tabStyle(Default, Inset),
  '&:hover': tabStyle(Hover, Inset),
  '&.Mui-selected': tabStyle(Current, Inset),
})

const tabPadding = (blockStart: SpacingKey, blockEnd: SpacingKey, inlineStart: SpacingKey, inlineEnd: SpacingKey) =>
  handleBreakpoints({
    paddingBlockStart: Spacing[blockStart as keyof typeof Spacing] ?? blockStart,
    paddingBlockEnd: Spacing[blockEnd as keyof typeof Spacing] ?? blockEnd,
    paddingInlineStart: Spacing[inlineStart as keyof typeof Spacing] ?? inlineStart,
    paddingInlineEnd: Spacing[inlineEnd as keyof typeof Spacing] ?? inlineEnd,
  })

/**
 * Generates CSS selector for inactive tabs (not selected and not hovered).
 *
 * @param hideInactiveBorders - If true, applies to all tabs when HIDE_INACTIVE_BORDERS_CLASS is present.
 *                             If false, applies to all tabs of the variant unconditionally.
 * @param variants - Tab variant class names
 */
const inactiveTabSelector = ({ hideInactiveBorders }: { hideInactiveBorders: boolean }, ...variants: string[]) =>
  variants
    .map(
      (variant) =>
        `&.${variant}${hideInactiveBorders ? `.${HIDE_INACTIVE_BORDERS_CLASS}` : ''} .MuiTab-root:not(.Mui-selected):not(:hover)::after`,
    )
    .join(', ')

// Generate per-size tab styles in the default horizontal orientation
const tabSizeStyles = (styles: (config: TabSizeConfig) => Record<string, unknown>) =>
  fromEntries(
    recordValues(TAB_SIZE_CONFIG).map((config) => [`&.${config.className} .MuiTab-root`, styles(config)] as const),
  )

// Generate per-size tab styles scoped to vertical orientation
const tabVerticalSizeStyles = (styles: (config: TabSizeConfig) => Record<string, unknown>) =>
  fromEntries(
    recordValues(TAB_SIZE_CONFIG).map(
      (config) => [`&.MuiTabs-vertical.${config.className} .MuiTab-root`, styles(config)] as const,
    ),
  )

const containedTabPadding = (inline: SpacingKey, blockEnd: SpacingKey) => ({
  boxSizing: TAB_BOX_SIZING,
  ...tabPadding(0, blockEnd, inline, inline),
})

const containedTabPaddingVertical = (inline: SpacingKey) => tabPadding(0, 0, inline, inline)

const linedTabPadding = (inline: SpacingKey) => ({
  boxSizing: TAB_BOX_SIZING,
  ...tabPadding(0, 0, inline, inline),
})

const centeredTabVariant = (variant: TabVariant) => ({
  '& .MuiTab-root': {
    ...tabVariant(variant),
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const linedSizeStyles = tabSizeStyles(({ inline, height }) => ({
  ...linedTabPadding(inline),
  height,
}))

const containedSizeStyles = tabSizeStyles(({ inline, height }) => ({
  ...containedTabPadding(inline, 'xxs'),
  height,
}))

const containedVerticalSizeStyles = tabVerticalSizeStyles(({ inline }) => containedTabPaddingVertical(inline))

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({
  Tabs: { UnderLined, OverLined, Contained },
  Layer,
}: DesignSystem): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0, // It's 48px by default in Mui, but we want it smaller
      position: 'relative', // For absolute positioning of scroll buttons

      '& .MuiButtonBase-root': {
        justifyContent: 'flex-end',
      },
      '&.MuiTabs-vertical .MuiButtonBase-root': {
        justifyContent: 'center',
        alignItems: 'start',
      },

      [`&.${contained}`]: {
        '& .MuiTab-root': tabVariant(Contained),
        // horizontal orientation
        '& .MuiTab-root:not(.Mui-selected):not(:last-child)': {
          marginRight: `${CONTAINED_TABS_MARGIN_RIGHT}px`,
        },
        // vertical orientation
        '&.MuiTabs-vertical .MuiTab-root:not(.Mui-selected):not(:last-child)': {
          marginRight: 0,
          marginBottom: '1px',
        },
        ...containedSizeStyles,
        ...containedVerticalSizeStyles,
      },

      [`&.${overlined}`]: {
        ...centeredTabVariant(OverLined),
        ...linedSizeStyles,
      },

      [`&.${underlined}`]: {
        ...centeredTabVariant(UnderLined),
        ...linedSizeStyles,
      },

      // Inactive tabs have a smaller border size
      [inactiveTabSelector({ hideInactiveBorders: false }, overlined, underlined)]: {
        height: BORDER_SIZE_INACTIVE,
        '.MuiTabs-vertical &': {
          height: '100%',
          width: BORDER_SIZE_INACTIVE,
        },
      },

      // ExtraExtraLarge tabs don't have a border hover for the underlined/overlined variants
      // Also override and hide inactive borders if configured so
      [`${inactiveTabSelector({ hideInactiveBorders: true }, overlined, underlined)}, &.${extraExtraLarge} .MuiTab-root::after`]:
        {
          height: '0px !important',
          '.MuiTabs-vertical &': {
            width: '0px !important',
          },
        },

      // Style scroll buttons (arrows) when tabs overflow
      '& .MuiTabScrollButton-root': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 1,
        color: Contained.Current.Outline,
        opacity: 1,
        backgroundColor: Layer[1].Fill,
        minWidth: 'auto',
        width: 'auto',
        '&:first-of-type': {
          left: 0,
        },
        '&:last-of-type': {
          right: 0,
        },
        '&.Mui-disabled': {
          opacity: 0,
        },
      },
    },
    indicator: {
      backgroundColor: Layer.Highlight.Outline,
      [`.${overlined} &`]: { top: 0 },
      [`.${contained} &`]: { top: 0 },

      [`.${extraExtraLarge} &`]: {
        height: BORDER_SIZE_LARGE,
      },

      '.MuiTabs-vertical &': {
        left: 0,
        right: 'auto',
        width: BORDER_SIZE,
      },
      [`.MuiTabs-vertical.${extraExtraLarge} &`]: {
        width: BORDER_SIZE_LARGE,
      },
    },
  },
})
