import { CssBaseline, ThemeProvider } from '@mui/material'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Decorator, Preview, ReactRenderer } from '@storybook/react'
import { chadTheme, darkTheme, lightTheme } from '../src/themes'
import { monaSans, hubotSans } from '../src/themes/typography'

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
  (Story) => (
    <>
      <style>
        {`
        @font-face {
          font-family: ${monaSans.style.fontFamily};
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url('fonts/Mona-Sans.woff2') format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
        @font-face {
          font-family: ${hubotSans.style.fontFamily};
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url('fonts/Hubot-Sans.woff2') format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }`}
      </style>
      <Story />
    </>
  )
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
