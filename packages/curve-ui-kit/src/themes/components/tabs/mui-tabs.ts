import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

// css classes used by the TabSwitcher component
const contained = 'variant-contained' as const
const underlined = 'variant-underlined' as const
const overlined = 'variant-overlined' as const
const small = 'size-small' as const
const medium = 'size-medium' as const
const large = 'size-large' as const
export const TABS_VARIANT_CLASSES = { contained, underlined, overlined }
export const TABS_HEIGHT_CLASSES = { small, medium, large }
export const HIDE_INACTIVE_BORDERS_CLASS = 'hide-inactive-borders'

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

const BORDER_SIZE = '2px' as const
const BORDER_SIZE_INACTIVE = '1px' as const
const BORDER_SIZE_LARGE = '4px' as const

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
      },

      '& .tab-suffix': {
        color: Text.TextColors.Tertiary,
      },
      '&:hover .tab-suffix': {
        color: 'inherit',
      },
      '&.Mui-selected .tab-suffix': {
        color: Text.TextColors.Secondary,
      },
    },
  },
})

type TabStyle = { Label?: string; Fill?: string; Outline?: string }
type TabVariant = { Inset?: string; Default: TabStyle; Hover: TabStyle; Current: TabStyle }
type SpacingKey = keyof typeof Spacing | string | number

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
    paddingBlockStart: blockStart in Spacing ? Spacing[blockStart as keyof typeof Spacing] : blockStart,
    paddingBlockEnd: blockEnd in Spacing ? Spacing[blockEnd as keyof typeof Spacing] : blockEnd,
    paddingInlineStart: inlineStart in Spacing ? Spacing[inlineStart as keyof typeof Spacing] : inlineStart,
    paddingInlineEnd: inlineEnd in Spacing ? Spacing[inlineEnd as keyof typeof Spacing] : inlineEnd,
  })

// Overlined and Underlined have common paddings and sizes.
const tabSizesNonContained = {
  [`&.${medium} .MuiTab-root`]: tabPadding('md', 'xs', 'md', 'md'),
  [`&.${large} .MuiTab-root`]: tabPadding('md', 'xs', 'md', 'md'),
}

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

      [`&.${contained}`]: {
        '& .MuiTab-root': tabVariant(Contained),
        '& .MuiTab-root:not(.Mui-selected):not(:last-child)': {
          marginRight: '1px',
        },

        [`&.${small} .MuiTab-root`]: {
          // blockStart has no padding (handled by minHeight and justifyContent)
          // blockEnd padding is handeled by the TabsSwitcher component to avoid adding extra height
          ...tabPadding(0, 0, 'sm', 'sm'),
          minHeight: '24px',
        },
        [`&.${medium} .MuiTab-root`]: {
          // blockStart has no padding (handled by minHeight and justifyContent)
          // blockEnd padding is handeled by the TabsSwitcher component to avoid adding extra height
          ...tabPadding(0, 0, 'sm', 'sm'),
          minHeight: '40px',
        },
      },

      [`&.${overlined}`]: {
        '& .MuiTab-root': tabVariant(OverLined),
        [`&.${small} .MuiTab-root`]: tabPadding('xs', 'xs', 'md', 'md'),
        // Large overline tabs don't get a hover fill
        [`&.${large} .MuiTab-root:hover`]: { backgroundColor: 'unset' },
        ...tabSizesNonContained,
      },

      [`&.${underlined}`]: {
        '& .MuiTab-root': tabVariant(UnderLined),
        [`&.${small} .MuiTab-root`]: tabPadding('xs', 'xs', 'sm', 'sm'),
        ...tabSizesNonContained,
      },

      // Inactive tabs have a smaller border size
      [inactiveTabSelector({ hideInactiveBorders: false }, overlined, underlined)]: {
        height: BORDER_SIZE_INACTIVE,
      },

      // Large tabs don't get a hover not over/underline inactive border
      // Also override and hide inactive borders if configured so
      [`${inactiveTabSelector({ hideInactiveBorders: true }, overlined, underlined)}, &.${large} .MuiTab-root::after`]:
        {
          height: '0px !important',
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

      [`.${large} &`]: {
        height: BORDER_SIZE_LARGE,
      },
    },
  },
})
