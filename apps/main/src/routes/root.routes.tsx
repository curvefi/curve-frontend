// Create root route
import { useCallback, useEffect, useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import type { Chain } from 'viem'
import { WagmiProvider } from 'wagmi'
import { getNetworkDefs } from '@/dex/lib/networks'
import { GlobalLayout } from '@/routes/GlobalLayout'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { OverlayProvider } from '@react-aria/overlays'
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { shouldForwardProp } from '@ui/styled-containers'
import type { NetworkDef } from '@ui/utils'
import {
  ConnectionProvider,
  createChainFromNetwork,
  createTransportFromNetwork,
  createWagmiConfig,
  defaultGetRpcUrls,
} from '@ui-kit/features/connect-wallet'
import { useLayoutStoreResponsive } from '@ui-kit/features/layout/store'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, usePathname } from '@ui-kit/hooks/router'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentApp, getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'

function useNetworkFromUrl(networks: NetworkDef[]) {
  const navigate = useNavigate()
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(() => networks.find((n) => n.id == networkId), [networkId, networks])
  useEffect(() => {
    if (network || !pathname) {
      return
    }
    const redirectUrl = networkId ? replaceNetworkInPath(pathname, 'ethereum') : getHashRedirectUrl(window.location)
    console.warn(`Network unknown in ${window.location.href}, redirecting to ${redirectUrl}...`)
    navigate(redirectUrl, { replace: true })
  }, [network, networkId, pathname, navigate])
  return network
}

const RootLayout = () => {
  const networkDefs = rootRoute.useLoaderData() as Awaited<ReturnType<typeof getNetworkDefs>>
  const networks = useMemo(() => recordValues(networkDefs), [networkDefs])
  const chains = useMemo(
    () => networks.map((network) => createChainFromNetwork(network, defaultGetRpcUrls)) as [Chain, ...Chain[]],
    [networks],
  )
  const transports = useMemo(
    () =>
      Object.fromEntries(
        networks.map((network) => [network.chainId, createTransportFromNetwork(network, defaultGetRpcUrls)]),
      ),
    [networks],
  )
  const config = useMemo(() => createWagmiConfig({ chains, transports }), [chains, transports])

  const pathname = usePathname()
  const push = useNavigate()
  useLayoutStoreResponsive()

  const onChainUnavailable = useCallback(
    <TChainId extends number>([walletChainId]: [TChainId, TChainId]) => {
      const network = networks[walletChainId]?.id
      if (pathname && network) {
        console.warn(`Network switched to ${network}, redirecting...`, pathname)
        push(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, push],
  )
  const network = useNetworkFromUrl(networks)
  const theme = useUserProfileStore((state) => state.theme)
  const currentApp = getCurrentApp(pathname)

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <OverlayProvider>
          <WagmiProvider config={config}>
            <QueryProvider persister={persister} queryClient={queryClient}>
              {network && (
                <ConnectionProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable}>
                  <GlobalLayout currentApp={currentApp} network={network} networks={networkDefs}>
                    <HeadContent />
                    <Outlet />
                    <TanStackRouterDevtools />
                  </GlobalLayout>
                </ConnectionProvider>
              )}
            </QueryProvider>
          </WagmiProvider>
        </OverlayProvider>
      </ThemeProvider>
    </StyleSheetManager>
  )
}

export const rootRoute = createRootRoute({
  loader: getNetworkDefs,
  component: RootLayout,
})
