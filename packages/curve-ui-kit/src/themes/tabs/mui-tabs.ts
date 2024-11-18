import type { Components } from '@mui/material/styles'
import { ThemeKey } from '../basic-theme'
import { FigmaTokens } from '../model'

export const TABS_VARIANT_CLASSES = {
  contained: 'variant-contained',
  underlined: 'variant-underlined',
  overlined: 'variant-overlined',
}

export type TabSwitcherVariants = keyof typeof TABS_VARIANT_CLASSES

export const defineMuiTabs = (figmaTokens: FigmaTokens, mode: ThemeKey): Components['MuiTabs'] => {
  // note: mui tabs do not support custom variants. Customize the standard variant. The custom TabSwitcher component should be used.
  const { contained, underlined, overlined } = figmaTokens.themes.desktop[mode].tabs

  return {
    styleOverrides: {
      root: {
        [`&.${TABS_VARIANT_CLASSES.contained} .MuiTab-root`]: {
          color: contained.default['label & icon'],
          backgroundColor: contained.default['fill'],
          '&:hover': {
            backgroundColor: contained.hover.fill,
            color: contained.hover['label & icon'],
          },
          '&.Mui-selected': {
            backgroundColor: contained.current.fill,
            color: contained.current['label & icon'],
          },
        },
        [`&.${TABS_VARIANT_CLASSES.overlined} .MuiTab-root`]: {
          color: overlined.default['label & icon'],
          borderTop: overlined.default['outline'],
          '&:hover': {
            borderTop: overlined.hover.outline,
            color: overlined.hover['label & icon'],
          },
          '&.Mui-selected': {
            borderTop: overlined.current.outline,
            color: overlined.current['label & icon'],
          },
        },
        [`&.${TABS_VARIANT_CLASSES.underlined} .MuiTab-root`]: {
          color: underlined.default['label & icon'],
          borderBottom: underlined.default.outline,
          '&:hover': {
            borderBottom: underlined.hover.outline,
            color: underlined.hover['label & icon'],
          },
          '&.Mui-selected': {
            borderBottom: underlined.current.outline,
            color: underlined.current['label & icon'],
          },
        },
      },
      indicator: {
        [`.${TABS_VARIANT_CLASSES.overlined} &`]: { top: 0 },
        [`.${TABS_VARIANT_CLASSES.contained} &`]: { top: 0 },
      },
    },
  }
}
