import type { Components } from '@mui/material/styles'
import { Palette } from '../palette'
import { BUTTONS_HEIGHTS } from '../button'

export const DEFAULT_BAR_SIZE = BUTTONS_HEIGHTS[1] // medium

// css classes used by the TabSwitcher component
const contained = 'variant-contained' as const;
const underlined = 'variant-underlined' as const;
const overlined = 'variant-overlined' as const;
export const TABS_VARIANT_CLASSES = { contained, underlined, overlined };

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

export const defineMuiTab = (): Components['MuiTab'] => ({
  styleOverrides: {
    root: { textTransform: 'uppercase', minHeight: DEFAULT_BAR_SIZE },
  },
})

// note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
export const defineMuiTabs = ({ text, primary, neutral, background }: Palette): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      [`&.${contained} .MuiTab-root`]: {
        color: text.secondary,
        backgroundColor: primary[200],
        '&:hover': {
          color: primary[950],
          backgroundColor: neutral[50],
        },
        '&.Mui-selected': {
          color: text.primary,
          backgroundColor: background.layer1Fill,
          borderColor: background.highlightOutline,
        },
      },
      [`&.${overlined} .MuiTab-root`]: {
        color: text.secondary,
        borderTop: background.layer2Outline,
        '&.Mui-selected': {
          color: text.primary,
          borderTop: primary[500],
        },
        '&:hover': {
          color: text.primary,
          paddingTop: '8px', // to compensate margin change
          marginBottom: '-2px', // to avoid jumping
          borderTop: `2px solid ${neutral.main}`,
          backgroundColor: neutral[200],
        },
      },
      [`&.${underlined} .MuiTab-root`]: {
        color: text.primary,
        borderBottom: background.layer2Outline,
        '&:hover': {
          color: text.highlight,
          borderBottom: background.highlightOutline,
        },
        '&.Mui-selected': {
          color: text.primary,
          borderBottom: background.highlightOutline,
        },
      },
    },
    indicator: {
      [`.${overlined} &`]: { top: 0 },
      [`.${contained} &`]: { top: 0 },
    },
  },
})
