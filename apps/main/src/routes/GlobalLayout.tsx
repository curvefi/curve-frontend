import { type ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { networks as daoNetworks } from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { networks as lendNetworks } from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLlamalendAppStats'
import { useLlamalendRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { networks as crvusdNetworks } from '@/loan/networks'
import { type TvlSource, useNetworksTVL } from '@evm-ui/entities/prices-networks.query'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { WagmiConnectModal } from '@evm-ui/features/connect-wallet/ui/WagmiConnectModal'
import type { Maintenance } from '@evm-ui/features/maintenance/hooks/useMaintenance'
import {
  APP_LINK,
  AppMenuOption,
  type AppName,
  createChainOption,
  createChainOptions,
  getInternalUrl,
  LlamalendApps,
} from '@evm-ui/shared/routes'
import { Footer } from '@evm-ui/widgets/Footer'
import { Header } from '@evm-ui/widgets/Header'
import type { NetworkDef, NetworkMapping } from '@legacy-ui/utils'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { type PartialRecord } from '@primitives/objects.utils'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
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

const TVL_SOURCES: Record<AppMenuOption, TvlSource> = {
  dex: 'pool',
  llamalend: 'lending',
  dao: 'pool', // kind of irrelevant for tvl, since it only supports mainnet
  bridge: 'pool', // only shows lending chains in the form but shows all networks in selector
  analytics: 'pool', // only has crvUSD charts, but shows all networks in selector
}

// Sometimes a network has been defined and needs to be accessed for legacy purposes, but we want to hide it from the list for whatever reason.
const HIDE_CHAINS: PartialRecord<AppMenuOption, number[]> = {
  dex: [Chain.ZkSync, Chain.Mantle],
}

export const GlobalLayout = <TId extends string, TChainId extends number>({
  children,
  backendMaintenance,
  currentApp,
  network,
  networks,
  userAddress,
}: {
  children: ReactNode
  backendMaintenance: Maintenance
  currentApp: AppName
  network: NetworkDef<TId, TChainId>
  networks: NetworkMapping<TId, TChainId>
  userAddress: Address | undefined
}) => {
  const currentMenu = getAppMenu(currentApp)
  const { connect, disconnect } = useWallet()
  const { address, isConnecting, isConnected } = useConnection()
  return (
    <Stack>
      <Header
        currentApp={currentApp}
        backendMaintenance={backendMaintenance}
        currentNetwork={createChainOption(network, currentApp)}
        currentMenu={currentMenu}
        supportedNetworks={createChainOptions(getSupportedNetworks(networks, currentApp), currentApp)}
        appStats={useAppStats(currentApp, network)}
        routes={useAppRoutes(network)}
        links={APP_LINK}
        urlFactory={getInternalUrl}
        hideChains={HIDE_CHAINS}
        tvls={useNetworksTVL(TVL_SOURCES[currentMenu])}
        connectWalletProps={{ disconnect, address, isConnecting, isConnected, connect }}
      />
      <Box
        component="main"
        sx={{ margin: `0 auto`, maxWidth: `var(--width)`, minHeight: MinHeight.pageContent, width: '100%' }}
      >
        <ErrorBoundary title={t`Page error`} userAddress={userAddress}>
          {children}
        </ErrorBoundary>
        <WagmiConnectModal />
      </Box>
      <Footer appName={currentApp} blockchainId={network.blockchainId} />
    </Stack>
  )
}
