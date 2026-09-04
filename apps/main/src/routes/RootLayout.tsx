import { type ReactNode, useEffect, useMemo } from 'react'
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
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { usePathname } from '@evm-ui/hooks/router'
import { useBodyThemeClass } from '@evm-ui/hooks/useBodyThemeClass'
import { useLayoutStoreResponsive } from '@evm-ui/hooks/useLayoutStoreResponsive'
import { useNetworkFromUrl } from '@evm-ui/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@evm-ui/hooks/useOnChainUnavailable'
import { getCurrentApp } from '@evm-ui/shared/routes'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import MuiLink from '@mui/material/Link'
import { maybe, recordValues } from '@primitives/objects.utils'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '@ui/components/ThemeProvider'
import { QueryProvider } from '@ui/features/queries/provider'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { addBreadcrumb } from '@ui/features/sentry'
import { t } from '@ui/lib/i18n'
import { IS_CYPRESS } from '@ui/utils/env'
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

const WagmiConfigProvider = ({ children }: { children: ReactNode }) => {
  const { data: networks } = useNetworksQuery()
  const chainIds = useMemo(
    () => maybe(networks, networks => recordValues(networks).map(network => network.chainId)),
    [networks],
  )
  const config = useWagmiConfig(chainIds)
  return config ? <WagmiProvider config={config}>{children}</WagmiProvider> : <Loading />
}

export const NetworkAwareLayout = () => {
  const backendMaintenance = useMaintenance(BACKEND_MAINTENANCE)
  const { data: networks } = useNetworksQuery()
  const network = useNetworkFromUrl(networks)
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)
  const onChainUnavailable = useOnChainUnavailable(networks)
  const { hydrate: dex } = useDexStore()
  const hydrate = useMemo(() => ({ dex }), [dex])
  useBreadcrumbs(pathname)

  return (
    <>
      {backendMaintenance.isMaintenanceMode ? (
        <MaintenancePage />
      ) : (
        networks && (
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
      )}
      {!IS_CYPRESS && <BackendMaintenanceModal {...backendMaintenance} />}
    </>
  )
}

export const RootLayout = ({ children }: { children: ReactNode }) => {
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
              <WagmiConfigProvider>{children}</WagmiConfigProvider>
              {devTools && <ReactQueryDevtools />}
            </QueryProvider>
          </OverlayProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </StyleSheetManager>
  )
}
