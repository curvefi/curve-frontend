import { CssBaseline, ThemeProvider } from '@mui/material'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Decorator, Preview, ReactRenderer } from '@storybook/react'

import { chadTheme, darkTheme, lightTheme } from '../src/entities/themes'

console.log('lightTheme', lightTheme)
export const decorators: Decorator[] = [
  withThemeFromJSXProvider<ReactRenderer>({
    themes: {
      light: lightTheme,
      dark: darkTheme,
      chad: chadTheme,
    },
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
]

const preview: Preview = {
  decorators: decorators,
  parameters: {
    themes: {
      light: lightTheme,
      dark: darkTheme,
      chad: chadTheme,
    },
    controls: {
      expanded: true, // Adds the description and default columns
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      // TODO: fix docs container theme
      // container: ({ children, context }) => {
      //   const theme = context.store.userGlobals.globals.theme
      //   return (
      //     <DocsContainer context={context}>
      //       <ThemeProvider theme={chadTheme}>
      //         <CssBaseline />
      //         {children}
      //       </ThemeProvider>
      //     </DocsContainer>
      //   )
      // },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default preview
