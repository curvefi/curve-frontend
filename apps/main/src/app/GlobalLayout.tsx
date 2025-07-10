import { type ReactNode } from 'react'
import daoNetworks from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { useLendAppStats } from '@/lend/hooks/useLendAppStats'
import lendNetworks from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLendAppStats'
import { useLoanAppStats } from '@/loan/hooks/useLoanAppStats'
import crvusdNetworks from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { APP_LINK, AppMenuOption, type AppName } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Footer } from '@ui-kit/widgets/Footer'
import { Header as Header } from '@ui-kit/widgets/Header'

const { MinHeight } = SizesAndSpaces

const useAppStats = (currentApp: string, network: NetworkDef) =>
  ({
    dao: [],
    crvusd: useLoanAppStats(currentApp === 'crvusd' && network?.chainId === 1 ? 1 : undefined),
    lend: useLendAppStats(currentApp === 'lend' ? (network?.chainId as LlamaChainId) : undefined),
    llamalend: useLlamalendAppStats(currentApp === 'llamalend'),
    dex: useDexAppStats(currentApp === 'dex' ? network : undefined),
  })[currentApp]

const useAppRoutes = (network: NetworkDef) => ({
  dao: APP_LINK.dao.routes,
  llamalend: APP_LINK.llamalend.routes,
  dex: useDexRoutes(network),
})

const useAppMenu = (app: AppName): AppMenuOption =>
  ({
    dao: 'dao' as const,
    crvusd: 'llamalend' as const,
    lend: 'llamalend' as const,
    llamalend: 'llamalend' as const,
    dex: 'dex' as const,
  })[app]

const useAppSupportedNetworks = (allNetworks: NetworkMapping, app: AppName) =>
  ({
    dao: daoNetworks,
    crvusd: crvusdNetworks,
    lend: lendNetworks,
    llamalend: lendNetworks,
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
      {children}
    </Box>
    <Footer appName={currentApp} networkId={network.id} />
  </Stack>
)
