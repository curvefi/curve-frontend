import type { Components } from '@mui/material/styles'
import { DesignSystem } from '../design'

// css classes used by the TabSwitcher component
const contained = 'variant-contained' as const;
const underlined = 'variant-underlined' as const;
const overlined = 'variant-overlined' as const;
const small = 'size-small' as const;
const medium = 'size-medium' as const;
const large = 'size-large' as const;
export const TABS_VARIANT_CLASSES = { contained, underlined, overlined };
export const TABS_HEIGHT_CLASSES = { small, medium, large };

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
export const defineMuiTabs = ({ Text, Color: { Primary, Neutral }, Layer }: DesignSystem): Components['MuiTabs'] => ({
  styleOverrides: {
    root: {
      minHeight: 0,
      [`&.${contained} .MuiTab-root`]: {
        color: Text.TextColors.Secondary,
        backgroundColor: Primary[200],
        '&:hover': {
          color: Primary[950],
          backgroundColor: Neutral[50],
          borderColor: Layer.Highlight.Outline,
        },
        '&.Mui-selected': {
          color: Text.TextColors.Primary,
          backgroundColor: Layer[1].Fill,
        },
      },
      [`&.${overlined} .MuiTab-root`]: {
        color: Text.TextColors.Secondary,
        '&.Mui-selected': { color: Text.TextColors.Primary },
        '&:hover': {
          color: Text.TextColors.Primary,
          borderColor: Layer.Highlight.Outline,
          backgroundColor: Neutral[200],
        },
      },
      [`&.${underlined} .MuiTab-root`]: {
        color: Text.TextColors.Primary,
        '&:hover': {
          color: Text.TextColors.Highlight,
          borderColor: Layer.Highlight.Outline,
        },
        '&.Mui-selected': {
          color: Text.TextColors.Primary,
        },
      },
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
