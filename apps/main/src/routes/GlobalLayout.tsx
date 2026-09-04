import { type ReactNode } from 'react'
import { networks as daoNetworks } from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { networks as lendNetworks } from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLlamalendAppStats'
import { useLlamalendRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { networks as crvusdNetworks } from '@/loan/networks'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { Maintenance } from '@evm-ui/features/maintenance/hooks/useMaintenance'
import { APP_LINK, AppMenuOption, type AppName, LlamalendApps } from '@evm-ui/shared/routes'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import { Footer } from '@evm-ui/widgets/Footer'
import { Header } from '@evm-ui/widgets/Header'
import type { NetworkDef, NetworkMapping } from '@legacy-ui/utils'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { MinHeight } = SizesAndSpaces

const useAppStats = (currentApp: AppName, network: NetworkDef) =>
  [
    useLlamalendAppStats({ chainId: network?.chainId, currentApp }, LlamalendApps.includes(currentApp)),
    useDexAppStats(network, currentApp === 'dex'),
  ].flat()

const useAppRoutes = (network: NetworkDef) => ({
  dao: APP_LINK.dao.routes,
  llamalend: useLlamalendRoutes(),
  dex: useDexRoutes(network),
  bridge: APP_LINK.bridge.routes,
  analytics: APP_LINK.analytics.routes,
})

const getAppMenu = (app: AppName): AppMenuOption =>
  ({
    dao: 'dao' as const,
    crvusd: 'llamalend' as const,
    lend: 'llamalend' as const,
    llamalend: 'llamalend' as const,
    dex: 'dex' as const,
    bridge: 'bridge' as const,
    analytics: 'analytics' as const,
  })[app]

const getSupportedNetworks = (allNetworks: NetworkMapping, app: AppName) =>
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
  backendMaintenance,
  currentApp,
  network,
  networks,
}: {
  children: ReactNode
  backendMaintenance: Maintenance
  currentApp: AppName
  network: NetworkDef<TId, TChainId>
  networks: NetworkMapping<TId, TChainId>
}) => (
  <Stack>
    <Header
      currentApp={currentApp}
      backendMaintenance={backendMaintenance}
      chainId={network.chainId}
      blockchainId={network.blockchainId}
      currentMenu={getAppMenu(currentApp)}
      supportedNetworks={getSupportedNetworks(networks, currentApp)}
      isLite={isLiteChain(network.chainId)}
      appStats={useAppStats(currentApp, network)}
      routes={useAppRoutes(network)}
    />
    <Box
      component="main"
      sx={{ margin: `0 auto`, maxWidth: `var(--width)`, minHeight: MinHeight.pageContent, width: '100%' }}
    >
      <ErrorBoundary title={t`Page error`}>{children}</ErrorBoundary>
    </Box>
    <Footer appName={currentApp} blockchainId={network.blockchainId} />
  </Stack>
)
