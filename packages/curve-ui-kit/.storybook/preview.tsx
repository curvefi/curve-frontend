import '@cy/eip6963-test-setup'
import { CssBaseline, ThemeProvider } from '@mui/material'
import Box from '@mui/material/Box'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import type { Decorator, Preview, ReactRenderer } from '@storybook/react-vite'
import { chadTheme, darkTheme, lightTheme } from '../src/themes'
import { createRouter, createRootRoute, RouterProvider, createMemoryHistory } from '@tanstack/react-router'

const themes = {
  light: lightTheme(),
  lightInverted: darkTheme({ inverted: true }),
  dark: darkTheme(),
  darkInverted: darkTheme({ inverted: true }),
  chad: chadTheme(),
  chadInverted: chadTheme({ inverted: true }),
}

export const decorators: Decorator[] = [
  withThemeFromJSXProvider<ReactRenderer>({
    themes,
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  (Story) => {
    const router = createRouter({
      routeTree: createRootRoute({ component: Story }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })

    return (
      <>
        <style>
          {`
        @font-face {
          font-family: MonaSans;
          src: url('fonts/Mona-Sans.woff2') format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
        @font-face {
          font-family: Minecraft;
          font-weight: normal;
          src: url('fonts/Minecraft-Regular.otf') format('opentype');
        }
        @font-face {
          font-family: Minecraft;
          font-weight: bold;
          src: url('fonts/Minecraft-Bold.otf') format('opentype');
        }
        `}
        </style>
        <RouterProvider router={router} />
      </>
    )
  },
]

const preview: Preview = {
  decorators: decorators,
  parameters: {
    themes,
    controls: {
      expanded: true, // Adds the description and default columns
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      // Implement a custom docs container that applies the theme at the root level.
      // Workaround for: https://github.com/storybookjs/storybook/issues/26242
      container: ({ children, context }) => {
        const theme = themes[context.store.userGlobals.globals.theme] ?? themes.light
        return (
          <DocsContainer context={context}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box sx={{ '& .docs-story': { backgroundColor: 'background.default' } }}>{children}</Box>
            </ThemeProvider>
          </DocsContainer>
        )
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default preview
