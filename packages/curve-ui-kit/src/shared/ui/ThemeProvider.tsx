export type * from '@mui/system/ThemeProvider'
import MuiThemeProvider from '@mui/system/ThemeProvider'
import { FunctionComponent, ReactNode } from 'react'
import { chadTheme, darkTheme, lightTheme } from '../../themes'

const themes = {
  light: lightTheme,
  dark: darkTheme,
  chad: chadTheme,
}

type ThemeProviderProps = {
  theme: keyof typeof themes
  children: ReactNode
}

export const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({ theme, children }) => (
  <MuiThemeProvider theme={themes[theme]}>{children}</MuiThemeProvider>
)
