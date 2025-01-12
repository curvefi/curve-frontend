import type { Components } from '@mui/material/styles'
import { DesignSystem } from '../design'
import { TransitionFunction } from '../design/0_primitives'

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
      minHeight: 0,
      '&::after': {
        content: '""',
        position: 'absolute',
        height: 2,
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

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({
  Tabs: { UnderLined, OverLined, Contained },
  Layer,
}: DesignSystem): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0,
      [`&.${contained} .MuiTab-root`]: tabVariant(Contained),
      [`&.${overlined} .MuiTab-root`]: tabVariant(OverLined),
      [`&.${underlined} .MuiTab-root`]: tabVariant(UnderLined),
      [`&.${small} .MuiTab-root`]: { paddingY: '6px 8px' }, // +2px border == 16px padding, 16px content == 32px total
      [`&.${medium} .MuiTab-root`]: { paddingY: '10px 12px' }, // +2px border == 24px padding, 16px content == 40px total
      [`&.${large} .MuiTab-root`]: { paddingY: '14px 16px' }, // +2px border == 32px padding, 16px content == 48px total
    },
    indicator: {
      backgroundColor: Layer.Highlight.Outline,
      [`.${overlined} &`]: { top: 0 },
      [`.${contained} &`]: { top: 0 },
    },
  },
})
