import { type ThemeOptions } from '@mui/material/styles'
import { BUTTONS_HEIGHTS, defineMuiButton } from '../../themes/button'
import { defineMuiTypography } from '../../themes/typography'
import { ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS } from './figma-tokens'

const BUTTON_SIZE = BUTTONS_HEIGHTS[1] // medium

export const createComponents = (mode: ThemeKey): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButton: defineMuiButton(FIGMA_TOKENS, mode),
  MuiIconButton: {
    styleOverrides: {
      root: { borderRadius: 0 }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 0 }
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: BUTTON_SIZE },
      indicator: { top: 0 }
    }
  },
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: BUTTON_SIZE, paddingX: 3 }
    }
  },
  MuiTab: {
    styleOverrides: {
      root: { textTransform: 'uppercase', minHeight: BUTTON_SIZE }
    }
  },
  MuiContainer: {
    styleOverrides: { root: { display: 'flex', maxWidth: 'var(--width)' } },
  },
  MuiSwitch: {
    styleOverrides: {
      root: { padding: '0', alignItems: 'center', width: '44px' },
      switchBase: { padding: '11px 4px' },
      track: { borderRadius: 0, width: '44px', height: '24px' },
      thumb: { borderRadius: 0, width: '16px', height: '16px' }
    }
  }
})
