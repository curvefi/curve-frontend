import { useEffect, useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import { WagmiProvider } from 'wagmi'
import { getNetworkDefs } from '@/dex/lib/networks'
import { GlobalLayout } from '@/routes/GlobalLayout'
import { recordValues } from '@curvefi/prices-api/objects.util'
import isPropValid from '@emotion/is-prop-valid'
import { OverlayProvider } from '@react-aria/overlays'
import { HeadContent, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ConnectionProvider } from '@ui-kit/features/connect-wallet'
import { useWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/useWagmiConfig'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePathname } from '@ui-kit/hooks/router'
import { useLayoutStoreResponsive } from '@ui-kit/hooks/useLayoutStoreResponsive'
import { useNetworkFromUrl } from '@ui-kit/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@ui-kit/hooks/useOnChainUnavailable'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { rootRoute } from './root.routes'

/**
 * This implements the default behavior from styled-components v5
 * For HTML elements, forward the prop if it is a valid HTML attribute. For other elements, forward all props.
 * TODO: Use transient props: https://styled-components.com/docs/faqs#transient-props-since-5.1
 */
const shouldForwardProp = (propName: string, target: unknown) => typeof target !== 'string' || isPropValid(propName)

export const RootLayout = () => {
  const networkDefs = rootRoute.useLoaderData() as Awaited<ReturnType<typeof getNetworkDefs>>
  const networks = useMemo(() => recordValues(networkDefs), [networkDefs])
  const network = useNetworkFromUrl(networks)
  const theme = useUserProfileStore((state) => state.theme)
  const currentApp = getCurrentApp(usePathname())
  const onChainUnavailable = useOnChainUnavailable(networks)
  const { location } = useRouterState()
  useLayoutStoreResponsive()

  useEffect(() => {
    // If there's a hash (#section-id), let the browser handle scrolling
    if (location.hash) return

    // Otherwise, scroll to top
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <OverlayProvider>
          <WagmiProvider config={useWagmiConfig(networks)}>
            <QueryProvider persister={persister} queryClient={queryClient}>
              {network && (
                <ErrorBoundary title={t`Layout error`}>
                  <ConnectionProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable}>
                    <GlobalLayout currentApp={currentApp} network={network} networks={networkDefs}>
                      <HeadContent />
                      <Outlet />
                      <TanStackRouterDevtools />
                    </GlobalLayout>
                  </ConnectionProvider>
                </ErrorBoundary>
              )}
            </QueryProvider>
          </WagmiProvider>
        </OverlayProvider>
      </ThemeProvider>
    </StyleSheetManager>
  )
}
