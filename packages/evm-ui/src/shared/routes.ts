import {
  getChainName,
  isChainConfigured,
  isLiteChain,
  isTestnet,
} from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { NetworkDef, NetworkMapping } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'
import { addQueryString } from '@primitives/fetch.utils'
import { recordValues } from '@primitives/objects.utils'
import type { ChainListOption } from '@ui/features/layout/switch-chain/ChainList'
import { t } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'

export { replaceNetworkInPath } from '@ui/features/layout/routes'

export const AppNames = ['dex', 'lend', 'crvusd', 'dao', 'llamalend', 'bridge', 'analytics'] as const
export type AppName = (typeof AppNames)[number]
export type AppMenuOption = 'dex' | 'llamalend' | 'dao' | 'bridge' | 'analytics'

type ChainParams = { blockchainId: string }

const appRoot = ({ app, blockchainId }: { app: AppName; blockchainId: string }) => ['', app, blockchainId].join('/')

export const dexPages = {
  root: ({ blockchainId }: ChainParams) => appRoot({ app: 'dex', blockchainId }),
  legal: (network: ChainParams) => [dexPages.root(network), 'legal'].join('/'),
  integrations: (network: ChainParams) => [dexPages.root(network), 'integrations'].join('/'),
  swap: ({ from, to, ...network }: ChainParams & { from?: Address; to?: Address }) =>
    [dexPages.root(network), 'swap'].join('/') + addQueryString({ from, to }),
  pools: (network: ChainParams) => [dexPages.root(network), 'pools'].join('/'),
  pool: ({ poolAddress, ...network }: ChainParams & { poolAddress: Address }) =>
    [dexPages.pools(network), poolAddress].join('/'),
  poolManagement: (params: ChainParams & { poolAddress: Address }) => [dexPages.pool(params), 'manage-pool'].join('/'),
  poolCreation: (network: ChainParams) => [dexPages.root(network), 'create-pool'].join('/'),
  gaugeDeployment: (network: ChainParams) => [dexPages.root(network), 'deploy-gauge'].join('/'),
  compensation: (network: ChainParams) => [dexPages.root(network), 'compensation'].join('/'),
} as const

export const lendPages = {
  root: ({ blockchainId }: ChainParams) => appRoot({ app: 'lend', blockchainId }),
  legal: (network: ChainParams) => [lendPages.root(network), 'legal'].join('/'),
  integrations: (network: ChainParams) => [lendPages.root(network), 'integrations'].join('/'),
  markets: (network: ChainParams) => [lendPages.root(network), 'markets'].join('/'),
  market: ({ marketId, ...network }: ChainParams & { marketId: Address }) =>
    [lendPages.markets(network), marketId].join('/'),
  vault: (params: ChainParams & { marketId: Address }) => [lendPages.market(params), 'vault'].join('/'),
} as const

export const crvUsdPages = {
  root: ({ blockchainId }: ChainParams) => appRoot({ app: 'crvusd', blockchainId }),
  legal: (network: ChainParams) => [crvUsdPages.root(network), 'legal'].join('/'),
  integrations: (network: ChainParams) => [crvUsdPages.root(network), 'integrations'].join('/'),
  markets: (network: ChainParams) => [crvUsdPages.root(network), 'markets'].join('/'),
  market: ({ collateralId, ...network }: ChainParams & { collateralId: string }) =>
    [crvUsdPages.markets(network), collateralId].join('/'),
  crvUsdStaking: (network: ChainParams) => [crvUsdPages.root(network), 'scrvUSD'].join('/'),
  psr: (network: ChainParams) => [crvUsdPages.root(network), 'psr'].join('/'),
} as const

export const llamalendRoutes = {
  root: ({ blockchainId }: ChainParams) => appRoot({ app: 'llamalend', blockchainId }),
  legal: (network: ChainParams) => [llamalendRoutes.root(network), 'legal'].join('/'),
  integrations: (network: ChainParams) => [llamalendRoutes.root(network), 'integrations'].join('/'),
  markets: (network: ChainParams) => [llamalendRoutes.root(network), 'markets'].join('/'),
} as const

export const daoPages = {
  root: () => appRoot({ app: 'dao', blockchainId: 'ethereum' }),
  proposals: () => [daoPages.root(), 'proposals'].join('/'),
  proposal: ({ proposalId }: { proposalId: string }) => [daoPages.proposals(), proposalId].join('/'),
  gauges: () => [daoPages.root(), 'gauges'].join('/'),
  gauge: ({ gaugeAddress }: { gaugeAddress: Address }) => [daoPages.gauges(), gaugeAddress].join('/'),
  veCrv: () => [daoPages.root(), 'vecrv'].join('/'),
  analytics: () => [daoPages.root(), 'analytics'].join('/'),
  user: ({ userAddress }: { userAddress: Address }) => [daoPages.root(), 'user', userAddress].join('/'),
  discussion: () => EXTERNAL_LINKS.curve.gov,
  legal: () => [daoPages.root(), 'legal'].join('/'),
  integrations: () => [daoPages.root(), 'integrations'].join('/'),
} as const

const analyticsPages = {
  root: ({ blockchainId }: ChainParams) => appRoot({ app: 'analytics', blockchainId }),
  legal: (network: ChainParams) => [analyticsPages.root(network), 'legal'].join('/'),
  integrations: (network: ChainParams) => [analyticsPages.root(network), 'integrations'].join('/'),
  home: (network: ChainParams) => [analyticsPages.root(network), 'home'].join('/'),
}

export const bridgePages = {
  root: ({ blockchainId }: ChainParams) => appRoot({ app: 'bridge', blockchainId }),
  legal: (network: ChainParams) => [bridgePages.root(network), 'legal'].join('/'),
  integrations: (network: ChainParams) => [bridgePages.root(network), 'integrations'].join('/'),
}

export const Pages = {
  dex: dexPages,
  lend: lendPages,
  crvusd: crvUsdPages,
  llamalend: llamalendRoutes,
  dao: daoPages,
  analytics: analyticsPages,
  bridge: bridgePages,
} as const

export type NavigationItem = {
  app: AppName
  route: (params: ChainParams) => string
  label: () => string // lazy evaluation for translations
  target?: '_self' | '_blank'
  matchMode?: 'prefix' | 'exact' // some pages have "../marketId" and "../marketId/vault" as routes, so we need to match the exact route
}

type AppNavigation = { label: string; routes: NavigationItem[] }

export const LlamalendApps: AppName[] = ['crvusd', 'lend', 'llamalend']

export const APP_LINK: Record<AppMenuOption, AppNavigation> = {
  dex: {
    label: 'DEX',
    routes: [
      { app: 'dex', route: dexPages.swap, label: () => t`Swap` },
      { app: 'dex', route: dexPages.pools, label: () => t`Pools` },
      { app: 'dex', route: dexPages.poolCreation, label: () => t`Pool Creation` },
    ],
  },
  llamalend: {
    label: 'Llamalend',
    routes: [
      { app: 'llamalend', route: llamalendRoutes.markets, label: () => t`Markets` },
      { app: 'crvusd', route: crvUsdPages.crvUsdStaking, label: () => t`Savings crvUSD` },
      { app: 'crvusd', route: crvUsdPages.psr, label: () => t`Peg Stability Reserves` },
    ],
  },
  dao: {
    label: 'Governance',
    routes: [
      { app: 'dao', route: daoPages.veCrv, label: () => t`Lock CRV` },
      { app: 'dao', route: daoPages.proposals, label: () => t`Proposals` },
      { app: 'dao', route: daoPages.gauges, label: () => t`Gauges` },
      { app: 'dao', route: daoPages.analytics, label: () => t`Analytics` },
      { app: 'dao', route: daoPages.discussion, label: () => t`Discussion`, target: '_blank' },
    ],
  },
  bridge: { label: t`Bridge`, routes: [{ app: 'bridge', route: bridgePages.root, label: () => t`Bridge` }] },
  analytics: { label: 'Analytics', routes: [{ app: 'analytics', route: analyticsPages.home, label: () => t`Home` }] },
}

const removeTrailingSlash = (pathname: string) => pathname.replace(/\/$/, '')

/** Converts a route to a page object, adding href and isActive properties */
export const routeToPage = (
  { route, target, label, matchMode }: NavigationItem,
  { blockchainId, pathname }: { blockchainId: string; pathname: string },
) => {
  const href = route({ blockchainId })
  // The pathname has no query string, but links can have one, like the default tokens of the swap page.
  const [hrefPath] = href.split('?')
  return {
    href,
    target,
    label: label(),
    isActive:
      // In-page section navigation can normalize the current pathname with a trailing slash.
      matchMode === 'exact'
        ? removeTrailingSlash(pathname) === removeTrailingSlash(hrefPath)
        : pathname.startsWith(hrefPath),
  }
}

export const getCurrentApp = (path: string | null): AppName => {
  const [, app] = path?.split('/') ?? []
  return AppNames.includes(app as AppName) ? (app as AppName) : 'dex'
}

/**
 * Gets the current network ID from the given URL path.
 * @param path - The URL path to extract the network ID from.
 * @returns The network ID if present, otherwise undefined (e.g., for the root path it's empty until redirected).
 */
export const getCurrentNetwork = (path: string): string | undefined => {
  const [, , blockchainId] = path?.split('/') ?? []
  return blockchainId
}

export const createChainOption = (network: NetworkDef, href: string): ChainListOption => ({
  ...network,
  name: getChainName(network.chainId),
  isConfigured: isChainConfigured(network.chainId),
  isLite: isLiteChain(network.chainId),
  isTestnet: isTestnet(network.chainId),
  href,
})

export const createChainOptions = (
  supportedNetworks: NetworkMapping,
  getHref: (blockchainId: string) => string,
): ChainListOption[] =>
  recordValues(supportedNetworks).map(network => createChainOption(network, getHref(network.blockchainId)))
