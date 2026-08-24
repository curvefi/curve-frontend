import { useEffect, useMemo } from 'react'
import { OverlayProvider } from 'react-aria'
import { StyleSheetManager } from 'styled-components'
import { WagmiProvider } from 'wagmi'
import { useNetworksQuery } from '@/dex/entities/networks'
import { useStore as useDexStore } from '@/dex/store/useStore'
import { BACKEND_MAINTENANCE } from '@/maintenances'
import isPropValid from '@emotion/is-prop-valid'
import MuiLink from '@mui/material/Link'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet, RouterProvider, useRouteContext, type AnyRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { CurveProvider } from '@ui-kit/features/connect-wallet'
import { useWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/useWagmiConfig'
import { BackendMaintenanceModal } from '@ui-kit/features/maintenance/components/BackendMaintenanceModal'
import { MaintenancePage } from '@ui-kit/features/maintenance/components/MaintenancePage'
import { useMaintenance } from '@ui-kit/features/maintenance/hooks/useMaintenance'
import { addBreadcrumb } from '@ui-kit/features/sentry'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePathname } from '@ui-kit/hooks/router'
import { useBodyThemeClass } from '@ui-kit/hooks/useBodyThemeClass'
import { useLayoutStoreResponsive } from '@ui-kit/hooks/useLayoutStoreResponsive'
import { useNetworkFromUrl } from '@ui-kit/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@ui-kit/hooks/useOnChainUnavailable'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { IS_CYPRESS } from '@ui-kit/utils'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { GlobalLayout } from './GlobalLayout'
import { Loading } from './Loading'

/**
 * This implements the default behavior from styled-components v5
 * For HTML elements, forward the prop if it is a valid HTML attribute. For other elements, forward all props.
 * TODO: Use transient props: https://styled-components.com/docs/faqs#transient-props-since-5.1
 */
const shouldForwardProp = (propName: string, target: unknown) => typeof target !== 'string' || isPropValid(propName)

const useBreadcrumbs = (pathname: string, { origin, search } = window.location) =>
  useEffect(
    () => addBreadcrumb(`Navigated to ${pathname}`, 'navigation', { origin, pathname, search }),
    [origin, pathname, search],
  )

export const NetworkAwareLayout = () => {
  const { backendMaintenance, networks } = useRouteContext({ from: '__root__' })
  const network = useNetworkFromUrl(networks)
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)
  const onChainUnavailable = useOnChainUnavailable(networks)
  const { hydrate: dex } = useDexStore()
  const hydrate = useMemo(() => ({ dex }), [dex])
  useBreadcrumbs(pathname)

  return (
    <CurveProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable} hydrate={hydrate}>
      {network ? (
        <GlobalLayout
          backendMaintenance={backendMaintenance}
          currentApp={currentApp}
          network={network}
          networks={networks}
        >
          <HeadContent />
          <Outlet />
        </GlobalLayout>
      ) : (
        <Loading />
      )}
      {!IS_CYPRESS && <TanStackRouterDevtools />}
    </CurveProvider>
  )
}

const RootContent = ({ router }: { router: AnyRouter }) => {
  const backendMaintenance = useMaintenance(BACKEND_MAINTENANCE)
  const { data: networks } = useNetworksQuery()
  const config = useWagmiConfig(networks)

  if (backendMaintenance.isMaintenanceMode) {
    return <MaintenancePage />
  }

  if (!config || !networks) {
    return <Loading />
  }

  return (
    <>
      <WagmiProvider config={config}>
        <RouterProvider router={router} context={{ backendMaintenance, networks }} />
      </WagmiProvider>
      {!IS_CYPRESS && <BackendMaintenanceModal {...backendMaintenance} />}
    </>
  )
}

export const RootLayout = ({ router }: { router: AnyRouter }) => {
  const theme = useUserProfileStore(state => state.theme)
  const devTools = !IS_CYPRESS
  useBodyThemeClass()
  useLayoutStoreResponsive()

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary title={t`Root layout error`} LinkComponent={MuiLink}>
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <RootContent router={router} />
              {devTools && <ReactQueryDevtools />}
            </QueryProvider>
          </OverlayProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </StyleSheetManager>
  )
}
