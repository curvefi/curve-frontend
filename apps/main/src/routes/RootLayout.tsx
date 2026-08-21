import { useEffect, useMemo } from 'react'
import { OverlayProvider } from 'react-aria'
import { StyleSheetManager } from 'styled-components'
import { WagmiProvider } from 'wagmi'
import { useNetworksQuery } from '@/dex/entities/networks'
import { useStore as useDexStore } from '@/dex/store/useStore'
import { BACKEND_MAINTENANCE } from '@/maintenances'
import isPropValid from '@emotion/is-prop-valid'
import { CurveProvider } from '@evm-ui/features/connect-wallet'
import { useWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/useWagmiConfig'
import { BackendMaintenanceModal } from '@evm-ui/features/maintenance/components/BackendMaintenanceModal'
import { MaintenancePage } from '@evm-ui/features/maintenance/components/MaintenancePage'
import { useMaintenance } from '@evm-ui/features/maintenance/hooks/useMaintenance'
import type { Maintenance } from '@evm-ui/features/maintenance/hooks/useMaintenance'
import { addBreadcrumb } from '@evm-ui/features/sentry'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { usePathname } from '@evm-ui/hooks/router'
import { useBodyThemeClass } from '@evm-ui/hooks/useBodyThemeClass'
import { useLayoutStoreResponsive } from '@evm-ui/hooks/useLayoutStoreResponsive'
import { useNetworkFromUrl } from '@evm-ui/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@evm-ui/hooks/useOnChainUnavailable'
import { persister, queryClient, QueryProvider } from '@evm-ui/lib/api'
import { t } from '@evm-ui/lib/i18n'
import { getCurrentApp } from '@evm-ui/shared/routes'
import { ThemeProvider } from '@evm-ui/shared/ui/ThemeProvider'
import { IS_CYPRESS } from '@evm-ui/utils'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
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

// Inner component that uses TanStack Query hooks
const NetworkAwareLayout = ({ backendMaintenance }: { backendMaintenance: Maintenance }) => {
  const { data: networks } = useNetworksQuery()
  const network = useNetworkFromUrl(networks)
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)
  const onChainUnavailable = useOnChainUnavailable(networks)
  const { hydrate: dex } = useDexStore()
  const hydrate = useMemo(() => ({ dex }), [dex])
  const config = useWagmiConfig(networks)
  useBreadcrumbs(pathname)
  useLayoutStoreResponsive()

  return config && networks ? (
    <WagmiProvider config={config}>
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
      </CurveProvider>
    </WagmiProvider>
  ) : (
    <Loading />
  )
}

export const RootLayout = () => {
  const theme = useUserProfileStore(state => state.theme)
  const backendMaintenance = useMaintenance(BACKEND_MAINTENANCE)
  const devTools = !IS_CYPRESS
  useBodyThemeClass()

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary title={t`Layout error`}>
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              {backendMaintenance.isMaintenanceMode ? (
                <MaintenancePage />
              ) : (
                <NetworkAwareLayout backendMaintenance={backendMaintenance} />
              )}
              {!IS_CYPRESS && <BackendMaintenanceModal {...backendMaintenance} />}
              {devTools && <ReactQueryDevtools />}
            </QueryProvider>
          </OverlayProvider>
          {devTools && <TanStackRouterDevtools />}
        </ErrorBoundary>
      </ThemeProvider>
    </StyleSheetManager>
  )
}
