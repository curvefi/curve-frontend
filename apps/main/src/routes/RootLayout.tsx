import { type ReactNode, useEffect, useMemo } from 'react'
import { OverlayProvider } from 'react-aria'
import { StyleSheetManager } from 'styled-components'
import { useConnection, WagmiProvider } from 'wagmi'
import { useNetworksQuery } from '@/dex/entities/networks'
import { useStore as useDexStore } from '@/dex/store/useStore'
import isPropValid from '@emotion/is-prop-valid'
import { CurveProvider } from '@evm-ui/features/connect-wallet'
import { useWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/useWagmiConfig'
import { useBodyThemeClass } from '@evm-ui/hooks/useBodyThemeClass'
import { useNetworkFromUrl } from '@evm-ui/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@evm-ui/hooks/useOnChainUnavailable'
import { getCurrentApp } from '@evm-ui/shared/routes'
import MuiLink from '@mui/material/Link'
import { maybe, recordValues } from '@primitives/objects.utils'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Loading } from '@ui/components/Loading'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { BackendMaintenanceGuard } from '@ui/features/maintenance/components/BackendMaintenanceGuard'
import { useMaintenance } from '@ui/features/maintenance/hooks/useMaintenance'
import { BACKEND_MAINTENANCE } from '@ui/features/maintenance/maintenance.config'
import { QueryProvider } from '@ui/features/queries/provider'
import { persister, queryClient } from '@ui/features/queries/query-client'
import { addBreadcrumb } from '@ui/features/sentry'
import { ThemeProvider } from '@ui/features/themes/ThemeProvider'
import { useUserProfileStore } from '@ui/features/user-profile'
import { usePathname } from '@ui/hooks/router'
import { useLayoutStoreResponsive } from '@ui/hooks/useLayoutStoreResponsive'
import { IS_CYPRESS } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'
import { GlobalLayout } from './GlobalLayout'

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
  const { address: userAddress } = useConnection()
  useBreadcrumbs(pathname)

  return (
    <ErrorBoundary title={t`Root route error`} userAddress={userAddress}>
      <HeadContent />
      <BackendMaintenanceGuard maintenance={backendMaintenance}>
        {networks && (
          <CurveProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable} hydrate={hydrate}>
            {network ? (
              <GlobalLayout
                backendMaintenance={backendMaintenance}
                currentApp={currentApp}
                network={network}
                networks={networks}
              >
                <Outlet />
              </GlobalLayout>
            ) : (
              <Loading />
            )}
            {!IS_CYPRESS && <TanStackRouterDevtools />}
          </CurveProvider>
        )}
      </BackendMaintenanceGuard>
    </ErrorBoundary>
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
