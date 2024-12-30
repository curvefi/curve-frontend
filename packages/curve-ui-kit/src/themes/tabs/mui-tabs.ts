import type { Components } from '@mui/material/styles'
import { DesignSystem } from '../design'

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

export const defineMuiTab = (): Components['MuiTab'] => ({
  styleOverrides: {
    root: {
      textTransform: 'uppercase',
      borderTop: '2px solid transparent',
      minHeight: 0,
      boxSizing: 'border-box',
    },
  },
})

type TabStyle = { Label?: string; Fill?: string; Outline?: string }
type TabVariant = { Default: TabStyle; Hover: TabStyle; Current: TabStyle }

const tabStyle = ({ Label, Fill, Outline }: TabStyle) => ({
  color: Label,
  backgroundColor: Fill,
  borderColor: Outline ?? 'transparent',
})

const tabVariant = ({ Current, Default, Hover }: TabVariant) => ({
  ...tabStyle(Default),
  '&:hover': tabStyle(Hover),
  '&.Mui-selected': tabStyle(Current),
})

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({
  Tabs: { UnderLined, OverLined, Contained },
  Layer,
}: DesignSystem): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0,
      ['&.MuiTabs-root [role="tablist"]']: { flexWrap: 'wrap' },
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
