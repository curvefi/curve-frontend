import type { ThemeKey } from '@ui-kit/themes/basic-theme'
import { useTheme } from '@mui/material/styles'
import MuiThemeProvider from '@mui/system/ThemeProvider'
import { ReactNode } from 'react'
import { chadTheme, darkTheme, lightTheme } from '../../themes'
import memoizee from 'memoizee'

export type * from '@mui/system/ThemeProvider'

const themes = {
  light: lightTheme,
  dark: darkTheme,
  chad: chadTheme,
}

const createTheme = memoizee((theme: ThemeKey, inverted?: boolean) => themes[theme]({ inverted }))

export const ThemeProvider = ({ theme: themeKey, children }: { theme: keyof typeof themes; children: ReactNode }) => (
  <MuiThemeProvider theme={createTheme(themeKey)}>{children}</MuiThemeProvider>
)

export const InvertTheme = ({
  children,
  inverted = true,
}: {
  children: ReactNode
  inverted?: boolean // allows to disable the inversion via prop
}) => {
  const { theme: themeName } = useTheme().design
  const theme = createTheme(themeName, inverted)
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
