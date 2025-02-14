export type * from '@mui/system/ThemeProvider'
import MuiThemeProvider from '@mui/system/ThemeProvider'
import { ReactNode, useMemo } from 'react'
import { chadTheme, darkTheme, lightTheme } from '../../themes'
import { useTheme } from '@mui/material/styles'

const themes = {
  light: lightTheme,
  dark: darkTheme,
  chad: chadTheme,
}

export const ThemeProvider = ({ theme: themeKey, children }: { theme: keyof typeof themes; children: ReactNode }) => {
  const theme = useMemo(() => themes[themeKey](), [themeKey])
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}

export const InvertTheme = ({ children, invert = true }: { children: ReactNode; invert?: boolean }) => {
  const {
    theme: themeName,
    options: { inverted },
  } = useTheme().design
  const theme = useMemo(() => themes[themeName]({ inverted: !inverted }), [inverted, themeName])
  if (!invert) return children
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
