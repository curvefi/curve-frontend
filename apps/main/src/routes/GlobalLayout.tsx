import { type ReactNode, useEffect } from 'react'
import { useConfig } from 'wagmi'
import { networks as daoNetworks } from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { useStore as useDexStore } from '@/dex/store/useStore'
import { networks as lendNetworks } from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLlamalendAppStats'
import { networks as crvusdNetworks } from '@/loan/networks'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { usePathname } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, AppMenuOption, type AppName } from '@ui-kit/shared/routes'
import { ScrollUpButton } from '@ui-kit/shared/ui/ScrollUpButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { Footer } from '@ui-kit/widgets/Footer'
import { Header as Header } from '@ui-kit/widgets/Header'

const { MinHeight } = SizesAndSpaces

const useAppStats = (currentApp: AppName, network: NetworkDef) => {
  const llamaLendApps: AppName[] = ['crvusd', 'lend', 'llamalend']
  const isLlamalend = llamaLendApps.includes(currentApp)

  const llamalendStats = useLlamalendAppStats({ chainId: network?.chainId }, isLlamalend)
  const dexStats = useDexAppStats(currentApp === 'dex' ? network : undefined) // 'disabled' by passing undefined

  return isLlamalend ? llamalendStats : currentApp === 'dex' ? dexStats : []
}

const useAppRoutes = (network: NetworkDef) => ({
  dao: APP_LINK.dao.routes,
  llamalend: APP_LINK.llamalend.routes,
  dex: useDexRoutes(network),
  bridge: APP_LINK.bridge.routes,
  analytics: APP_LINK.analytics.routes,
})

const useAppMenu = (app: AppName): AppMenuOption =>
  ({
    dao: 'dao' as const,
    crvusd: 'llamalend' as const,
    lend: 'llamalend' as const,
    llamalend: 'llamalend' as const,
    dex: 'dex' as const,
    bridge: 'bridge' as const,
    analytics: 'analytics' as const,
  })[app]

const useAppSupportedNetworks = (allNetworks: NetworkMapping, app: AppName) =>
  ({
    dao: daoNetworks,
    crvusd: crvusdNetworks,
    lend: lendNetworks,
    llamalend: lendNetworks,
    dex: allNetworks,
    bridge: allNetworks,
    analytics: allNetworks,
  })[app]

// when the mobile drawer is open, we want to ignore the scrollbar and expand the content to full page width
const EXPAND_WHEN_HIDDEN = { '[aria-hidden="true"] &': { width: '100vw' } }

const stripTrailingSlash = (path: string) => path.replace(/\/+$/, '')

const useHydrateDexPoolsOnDemand = (currentApp: AppName, network: NetworkDef) => {
  const pathname = stripTrailingSlash(usePathname())
  const config = useConfig()
  const { curveApi } = useCurve()
  const hydrateDex = useDexStore((state) => state.hydrate)
  const haveAllPools = useDexStore((state) => state.pools.haveAllPools[network.chainId])

  useEffect(() => {
    if (currentApp !== 'dex' || !curveApi || haveAllPools) return

    const swapPathPrefix = `/dex/${network.id}/swap`
    if (pathname === swapPathPrefix || pathname.startsWith(`${swapPathPrefix}/`)) return

    void hydrateDex(config, curveApi, curveApi, undefined)
  }, [config, curveApi, currentApp, haveAllPools, hydrateDex, network.id, pathname])
}

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
  useHydrateDexPoolsOnDemand(currentApp, network)

  return (
    <Stack sx={EXPAND_WHEN_HIDDEN}>
      <Header
        currentApp={currentApp}
        chainId={network.chainId}
        networkId={network.id}
        currentMenu={useAppMenu(currentApp)}
        supportedNetworks={useAppSupportedNetworks(networks, currentApp)}
        isLite={network.isLite}
        appStats={useAppStats(currentApp, network)}
        routes={useAppRoutes(network)}
      />
      <Box
        component="main"
        sx={{ margin: `0 auto`, maxWidth: `var(--width)`, minHeight: MinHeight.pageContent, width: '100%' }}
      >
        <ErrorBoundary title={t`Page error`}>{children}</ErrorBoundary>
      </Box>
      <Footer appName={currentApp} networkId={network.id} />
      <ScrollUpButton visible={useLayoutStore((state) => state.showScrollButton)} />
    </Stack>
  )
}
