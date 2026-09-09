import { type ReactNode } from 'react'
import { useConnection, useEnsName } from 'wagmi'
import { networks as daoNetworks } from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { networks as lendNetworks } from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLlamalendAppStats'
import { useLlamalendRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { networks as crvusdNetworks } from '@/loan/networks'
import { type TvlSource, useNetworksTVL } from '@evm-ui/entities/prices-networks.query'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { WagmiConnectModal } from '@evm-ui/features/connect-wallet/ui/WagmiConnectModal'
import {
  APP_LINK,
  AppMenuOption,
  type AppName,
  createChainOption,
  createChainOptions,
  getInternalUrl,
  LlamalendApps,
  routeToPage,
} from '@evm-ui/shared/routes'
import { EvmBanners } from '@evm-ui/shared/ui/EvmBanners'
import { shortenAddress } from '@evm-ui/utils'
import type { NetworkDef, NetworkMapping } from '@legacy-ui/utils'
import { Chain } from '@primitives/network.utils'
import { mapRecord, maybe, type PartialRecord } from '@primitives/objects.utils'
import { Footer } from '@ui/features/layout/Footer'
import { getFooterSections } from '@ui/features/layout/Footer/footer-sections.util'
import { Header } from '@ui/features/layout/Header'
import { getHeaderSections } from '@ui/features/layout/Header/header-sections.util'
import { PageLayout } from '@ui/features/layout/PageLayout'
import type { Maintenance } from '@ui/features/maintenance/hooks/useMaintenance'
import { usePathname } from '@ui/hooks/router'

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

const APP_TO_MENU = {
  dao: 'dao',
  crvusd: 'llamalend',
  lend: 'llamalend',
  llamalend: 'llamalend',
  dex: 'dex',
  bridge: 'bridge',
  analytics: 'analytics',
} as const satisfies Record<AppName, AppMenuOption>

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
const HIDE_CHAINS: PartialRecord<AppMenuOption, number[]> = { dex: [Chain.ZkSync, Chain.Mantle] }

/** Resolves the given links based on current network and pathname */
const resolveLinks = ({ blockchainId, pathname }: { blockchainId: string; pathname: string }) =>
  mapRecord(APP_LINK, (_menu, { label, routes }) => ({
    label,
    href: getInternalUrl(routes[0].app, blockchainId),
    pages: routes.map(route => routeToPage(route, { blockchainId, pathname })),
  }))

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
}) => {
  const { connect, disconnect } = useWallet()
  const { address, isConnecting, isConnected } = useConnection()
  const addressLabel = useEnsName({ address }).data ?? maybe(address, shortenAddress)
  const { blockchainId, chainId } = network

  const currentMenu = APP_TO_MENU[currentApp]
  const routeContext = { blockchainId, pathname: usePathname() }
  const formatUrl = (page: string) => getInternalUrl(currentApp, blockchainId, page)

  return (
    <PageLayout
      header={
        <Header
          banners={
            <EvmBanners
              chainId={chainId}
              blockchainId={blockchainId}
              currentApp={currentApp}
              backendMaintenance={backendMaintenance}
              isConnected={isConnected}
            />
          }
          currentNetwork={createChainOption(network, currentApp)}
          currentMenu={currentMenu}
          supportedNetworks={createChainOptions(getSupportedNetworks(networks, currentApp), currentApp)}
          appStats={useAppStats(currentApp, network)}
          pages={useAppRoutes(network)[currentMenu].map(route => routeToPage(route, routeContext))}
          links={resolveLinks(routeContext)}
          sections={getHeaderSections(formatUrl)}
          hideChains={HIDE_CHAINS}
          tvls={useNetworksTVL(TVL_SOURCES[currentMenu])}
          connectWalletProps={{ disconnect, address, addressLabel, isConnecting, isConnected, connect }}
        />
      }
      userAddress={address}
      connectModal={<WagmiConnectModal />}
      footer={<Footer sections={getFooterSections(formatUrl)} />}
    >
      {children}
    </PageLayout>
  )
}
