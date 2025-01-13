import type { Components } from '@mui/material/styles'
import { basicMuiTheme } from '../basic-theme'
import { DesignSystem } from '../design'
import { TransitionFunction } from '../design/0_primitives'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

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

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

const BORDER_SIZE = '2px' as const
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

export const defineMuiTab = ({ Tabs: { Transition } }: DesignSystem): Components['MuiTab'] => ({
  styleOverrides: {
    root: {
      transition: Transition,
      textTransform: 'uppercase',
      position: 'relative',
      boxSizing: 'content-box',
      opacity: 1,
      minHeight: '2rem', // Not responsive, but Sizing.md is ugly in mobile
      minWidth: 0, // It's 90px by default in Mui, but we want it smaller
      '&::after': {
        content: '""',
        position: 'absolute',
        height: BORDER_SIZE,
        opacity: 0,
        transition: `opacity ${TransitionFunction}`,
      },
    },
  },
})

type TabStyle = { Label?: string; Fill?: string; Outline?: string }
type TabVariant = { Inset?: string; Default: TabStyle; Hover: TabStyle; Current: TabStyle }

const tabStyle = ({ Label, Fill, Outline }: TabStyle) => ({
  color: Label,
  backgroundColor: Fill,
  '::after': {
    backgroundColor: Outline ?? 'transparant',
  },
})

const tabVariant = ({ Current, Default, Hover, Inset }: TabVariant) => ({
  ...tabStyle(Default),
  '&:hover': tabStyle(Hover),
  '&:hover::after': { opacity: 1 },
  '&.Mui-selected': tabStyle(Current),
  '&.Mui-selected::after': { opacity: 1 },
  '::after': Inset && {
    inset: Inset,
  },
})

const tabPadding = (
  blockStart: keyof typeof Spacing,
  blockEnd: keyof typeof Spacing,
  inlineStart: keyof typeof Spacing,
  inlineEnd: keyof typeof Spacing,
) =>
  Object.entries(basicMuiTheme.breakpoints.keys)
    .map(([, bp]) => bp)
    .reduce(
      (acc, bp) => ({
        ...acc,
        [basicMuiTheme.breakpoints.up(bp)]: {
          paddingBlockStart: Spacing[blockStart][bp],
          paddingBlockEnd: Spacing[blockEnd][bp],
          paddingInlineStart: Spacing[inlineStart][bp],
          paddingInlineEnd: Spacing[inlineEnd][bp],
        },
      }),
      {},
    )

// Overlined and Underlined have common paddings and sizes.
const tabSizesNonContained = {
  [`&.${medium} .MuiTab-root`]: tabPadding('md', 'xs', 'md', 'md'),
  [`&.${large} .MuiTab-root`]: tabPadding('md', 'xs', 'md', 'md'),
}

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({
  Tabs: { UnderLined, OverLined, Contained },
  Layer,
}: DesignSystem): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0, // It's 48px by default in Mui, but we want it smaller
      [`&.${contained}`]: {
        '& .MuiTab-root': tabVariant(Contained),
        [`&.${small} .MuiTab-root`]: tabPadding('xs', 'xs', 'md', 'md'),
        [`&.${medium} .MuiTab-root`]: tabPadding('md', 'xs', 'lg', 'lg'),
      },

      [`&.${overlined}`]: {
        '& .MuiTab-root': tabVariant(OverLined),
        [`&.${small} .MuiTab-root`]: tabPadding('xs', 'xs', 'md', 'md'),
        ...tabSizesNonContained,
      },

      [`&.${underlined}`]: {
        '& .MuiTab-root': tabVariant(UnderLined),
        [`&.${small} .MuiTab-root`]: tabPadding('xs', 'xs', 'sm', 'sm'),
        ...tabSizesNonContained,
      },

      // Large tabs get a larger border size.
      [`&.${large} .MuiTab-root::after`]: {
        height: BORDER_SIZE_LARGE,
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
