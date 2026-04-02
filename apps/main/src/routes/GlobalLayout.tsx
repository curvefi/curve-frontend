import { type ReactNode } from 'react'
import { networks as daoNetworks } from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { networks as lendNetworks } from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLlamalendAppStats'
import { useLlamalendRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { networks as crvusdNetworks } from '@/loan/networks'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, AppMenuOption, type AppName } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { Footer } from '@ui-kit/widgets/Footer'
import { Header } from '@ui-kit/widgets/Header'

const { MinHeight } = SizesAndSpaces

const LLAMALEND_APPS: AppName[] = ['crvusd', 'lend', 'llamalend']

const useAppStats = (currentApp: AppName, network: NetworkDef) => {
  const isLlamalendApp = LLAMALEND_APPS.includes(currentApp)
  console.log({ isLlamalendApp, LLAMALEND_APPS, currentApp })
  const llamalendStats = useLlamalendAppStats({ chainId: network?.chainId, currentApp }, isLlamalendApp)
  const dexStats = useDexAppStats(currentApp === 'dex' ? network : undefined) // 'disabled' by passing undefined
  return isLlamalendApp ? llamalendStats : currentApp === 'dex' ? dexStats : []
}

const useAppRoutes = (network: NetworkDef) => ({
  dao: APP_LINK.dao.routes,
  llamalend: useLlamalendRoutes(),
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
}) => (
  <Stack>
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
  </Stack>
)
