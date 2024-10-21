import { CssBaseline, ThemeProvider } from '@mui/material'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Decorator, Preview, ReactRenderer } from '@storybook/react'

import { chadTheme, darkTheme, lightTheme } from '../src/entities/themes'

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
      // TODO: Fix docs container theme application
      // The current issue is that the theme is only applied to individual components
      // within the docs, but not to the root level of the documentation container.
      // This results in inconsistent styling, where component examples may have the
      // correct theme, but the surrounding documentation does not.
      //
      // Potential solution:
      // Implement a custom docs container that applies the theme at the root level.
      // This may involve creating a wrapper component that uses the current theme
      // from the Storybook context and applies it to the entire docs container.
      //
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
