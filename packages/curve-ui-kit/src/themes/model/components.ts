import { type ThemeOptions } from '@mui/material/styles'
import { BUTTONS_HEIGHTS, defineMuiButton } from '../../themes/button'
import { defineMuiTypography } from '../../themes/typography'
import { ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS } from './figma-tokens.generated'

export const DEFAULT_BAR_SIZE = BUTTONS_HEIGHTS[1] // medium

export const createComponents = (mode: ThemeKey): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true
    }
  },
  MuiButton: defineMuiButton(FIGMA_TOKENS, mode),
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: DEFAULT_BAR_SIZE },
      indicator: { top: 0 }
    }
  },
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: DEFAULT_BAR_SIZE, paddingX: 3 }
    }
  },
  MuiTab: {
    styleOverrides: {
      root: { textTransform: 'uppercase', minHeight: DEFAULT_BAR_SIZE }
    }
  },
  MuiContainer: {
    styleOverrides: { root: { display: 'flex', maxWidth: 'var(--width)' } },
  },
  MuiSwitch: {
    styleOverrides: {
      root: { padding: 0, alignItems: 'center', height: '30px', width: '44px' },
      switchBase: { padding: '7px 4px', borderRadius: 0 },
      track: { borderRadius: 0, width: '44px', height: '24px' },
      thumb: { borderRadius: 0, width: '16px', height: '16px' }
    }
  }
})
