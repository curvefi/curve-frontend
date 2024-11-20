import type { Components } from '@mui/material/styles'
import { ThemeKey } from '../basic-theme'
import { Palette } from '../palette'

// css classes used by the TabSwitcher component
const contained = 'variant-contained' as const;
const underlined = 'variant-underlined' as const;
const overlined = 'variant-overlined' as const;
export const TABS_VARIANT_CLASSES = { contained, underlined, overlined };

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

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
        color: text.tertiary,
        borderTop: background.layer2Outline,
        '&:hover': {
          color: text.primary,
          borderTop: neutral[500],
        },
        '&.Mui-selected': {
          color: text.highlight,
          backgroundColor: background.layer3Fill,
          borderTop: background.highlightOutline,
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
