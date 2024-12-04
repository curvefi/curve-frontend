import type { Components } from '@mui/material/styles'
import { Palette } from '../palette'

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

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({ text, primary, neutral, background }: Palette): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0,
      [`&.${contained} .MuiTab-root`]: {
        color: text.secondary,
        backgroundColor: primary[200],
        '&:hover': {
          color: primary[950],
          backgroundColor: neutral[50],
          borderColor: background.highlightOutline,
        },
        '&.Mui-selected': {
          color: text.primary,
          backgroundColor: background.layer1Fill,
        },
      },
      [`&.${overlined} .MuiTab-root`]: {
        color: text.secondary,
        '&.Mui-selected': { color: text.primary },
        '&:hover': {
          color: text.primary,
          borderColor: background.highlightOutline,
          backgroundColor: neutral[200],
        },
      },
      [`&.${underlined} .MuiTab-root`]: {
        color: text.primary,
        '&:hover': {
          color: text.highlight,
          borderColor: background.highlightOutline,
        },
        '&.Mui-selected': {
          color: text.primary,
        },
      },
      [`&.${small} .MuiTab-root`]: { paddingY: '6px 8px' }, // +2px border == 16px padding, 16px content == 32px total
      [`&.${medium} .MuiTab-root`]: { paddingY: '10px 12px' }, // +2px border == 24px padding, 16px content == 40px total
      [`&.${large} .MuiTab-root`]: { paddingY: '14px 16px' }, // +2px border == 32px padding, 16px content == 48px total
    },
    indicator: {
      backgroundColor: background.highlightOutline,
      [`.${overlined} &`]: { top: 0 },
      [`.${contained} &`]: { top: 0 },
    },
  },
})
