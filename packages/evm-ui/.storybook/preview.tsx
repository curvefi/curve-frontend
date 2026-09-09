import '../src/eip6963-test-setup'
import type { PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import Box from '@mui/material/Box'
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Decorator, Preview, ReactRenderer } from '@storybook/react-vite'
import { createRouter, createRootRoute, RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { chadTheme, darkTheme, lightTheme } from '@ui/features/themes/themes'
import '@ui/styles/initial-load.css'
import { Toast } from '../src/widgets/Toast'

const themes = {
  light: lightTheme(),
  lightInverted: darkTheme({ inverted: true }),
  dark: darkTheme(),
  darkInverted: darkTheme({ inverted: true }),
  chad: chadTheme(),
  chadInverted: chadTheme({ inverted: true }),
}

const decorators: Decorator[] = [
  withThemeFromJSXProvider<ReactRenderer>({
    themes,
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  Story => {
    const router = createRouter({
      routeTree: createRootRoute({ component: Story }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })

    return (
      <>
        <RouterProvider router={router} />
        <Toast />
      </>
    )
  },
]

const preview: Preview = {
  decorators,
  parameters: {
    themes,
    controls: {
      expanded: true, // Adds the description and default columns
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    docs: {
      container: ({ children, context }: PropsWithChildren<DocsContainerProps>) => {
        // @ts-expect-error - context.store is private API but works at runtime; see https://github.com/storybookjs/storybook/issues/26242
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
        const themeName = context.store.userGlobals.globals.theme
        const theme = themeName in themes ? themes[themeName as keyof typeof themes] : themes.light
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

// eslint-disable-next-line import-x/no-default-export
export default preview
