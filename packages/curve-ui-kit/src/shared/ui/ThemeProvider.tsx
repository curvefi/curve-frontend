export type * from '@mui/system/ThemeProvider'
import MuiThemeProvider from '@mui/system/ThemeProvider'
import { FunctionComponent, ReactNode, useMemo } from 'react'
import { chadTheme, darkTheme, lightTheme } from '../../themes'
import { useTheme } from '@mui/material'

const themes = {
  light: lightTheme,
  dark: darkTheme,
  chad: chadTheme,
}

type ThemeProviderProps = {
  theme: keyof typeof themes
  children: ReactNode
}

export const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({ theme: themeKey, children }) => {
  const theme = useMemo(() => themes[themeKey](), [themeKey])
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}

export const InvertTheme = ({ children }: { children: ReactNode }) => {
  const {
    theme: themeName,
    options: { inverted },
  } = useTheme().design
  const theme = useMemo(() => themes[themeName]({ inverted: !inverted }), [inverted, themeName])
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
