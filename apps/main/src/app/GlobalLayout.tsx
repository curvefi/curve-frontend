import { type ReactNode, useMemo, useRef } from 'react'
import daoNetworks from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { useLendAppStats } from '@/lend/hooks/useLendAppStats'
import lendNetworks from '@/lend/networks'
import { useLoanAppStats } from '@/loan/hooks/useLoanAppStats'
import crvusdNetworks from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useLayoutHeight } from '@ui-kit/hooks/useResizeObserver'
import { APP_LINK, AppMenuOption, type AppName } from '@ui-kit/shared/routes'
import { Footer } from '@ui-kit/widgets/Footer'
import { Header as Header, useHeaderHeight } from '@ui-kit/widgets/Header'

const useAppStats = (currentApp: string, network: NetworkDef) =>
  ({
    dao: [],
    crvusd: useLoanAppStats(currentApp === 'crvusd' && network?.chainId === 1 ? 1 : undefined),
    lend: useLendAppStats(currentApp === 'lend' ? (network?.chainId as LlamaChainId) : undefined),
    dex: useDexAppStats(currentApp === 'dex' ? network : undefined),
  })[currentApp]

export const useAppRoutes = (network: NetworkDef) => ({
  dao: APP_LINK.dao.routes,
  llamalend: APP_LINK.llamalend.routes,
  dex: useDexRoutes(network),
})

export const useAppMenu = (app: AppName): AppMenuOption =>
  ({
    dao: 'dao' as const,
    crvusd: 'llamalend' as const,
    lend: 'llamalend' as const,
    dex: 'dex' as const,
  })[app]

export const useAppSupportedNetworks = (allNetworks: NetworkMapping, app: AppName) =>
  ({
    dao: daoNetworks,
    crvusd: crvusdNetworks,
    lend: lendNetworks,
    dex: allNetworks,
  })[app]

export const GlobalLayout = <TId extends string, TChainId extends number>({
  children,
  currentApp,
  network,
  networks,
}: {
  children: ReactNode
  currentApp: AppName
  network: NetworkDef<TId, TChainId>
  networks: NetworkMapping<TId, TChainId>
}) => {
  const setLayoutHeight = useLayoutStore((state) => state.setLayoutHeight)
  const layoutHeight = useLayoutStore((state) => state.height)
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)

  const globalAlertRef = useRef<HTMLDivElement>(null)
  const mainNavRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert', setLayoutHeight)
  useLayoutHeight(mainNavRef, 'mainNav', setLayoutHeight)

  const minHeight = useMemo(
    () => Object.values(layoutHeight).reduce((acc, height) => acc + height, 0) - layoutHeight.footer + 24,
    [layoutHeight],
  )

  const supportedNetworks = useAppSupportedNetworks(networks, currentApp)

  return (
    <Stack sx={{ minHeight: `calc(100vh - ${layoutHeight?.globalAlert}px)` }}>
      <Header
        currentApp={currentApp}
        chainId={network.chainId}
        networkId={network.id}
        mainNavRef={mainNavRef}
        currentMenu={useAppMenu(currentApp)}
        supportedNetworks={supportedNetworks}
        globalAlertRef={globalAlertRef}
        isLite={network.isLite}
        appStats={useAppStats(currentApp, network)}
        routes={useAppRoutes(network)}
      />
      <Box
        component="main"
        sx={{ margin: `0 auto`, maxWidth: `var(--width)`, minHeight: `calc(100vh - ${minHeight}px)` }}
      >
        {children}
      </Box>
      <Footer appName={currentApp} networkId={network.id} headerHeight={useHeaderHeight(bannerHeight)} />
    </Stack>
  )
}
