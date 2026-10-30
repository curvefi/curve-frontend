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

type NetworkParams = { app: AppName; blockchainId: string }
type AppNetworkParams = Omit<NetworkParams, 'app'>

const internalUrl = ({ app, blockchainId }: NetworkParams) => ['', app, blockchainId].join('/')

const sharedRoutes = (app: AppName) => {
  const ROOT = ({ blockchainId }: AppNetworkParams) => internalUrl({ app, blockchainId })
  return {
    ROOT,
    PAGE_LEGAL: (network: AppNetworkParams) => [ROOT(network), 'legal'].join('/'),
    PAGE_INTEGRATIONS: (network: AppNetworkParams) => [ROOT(network), 'integrations'].join('/'),
  }
}

export const DEX_ROUTES = {
  ...sharedRoutes('dex'),
  PAGE_SWAP: ({ from, to, ...network }: AppNetworkParams & { from?: Address; to?: Address }) =>
    [DEX_ROUTES.ROOT(network), 'swap'].join('/') + addQueryString({ from, to }),
  PAGE_POOLS: (network: AppNetworkParams) => [DEX_ROUTES.ROOT(network), 'pools'].join('/'),
  PAGE_POOL: ({ poolAddress, ...network }: AppNetworkParams & { poolAddress: Address }) =>
    [DEX_ROUTES.ROOT(network), 'pools', poolAddress].join('/'),
  PAGE_MANAGE_POOL: ({ poolAddress, ...network }: AppNetworkParams & { poolAddress: Address }) =>
    [DEX_ROUTES.ROOT(network), 'pools', poolAddress, 'manage-pool'].join('/'),
  PAGE_CREATE_POOL: (network: AppNetworkParams) => [DEX_ROUTES.ROOT(network), 'create-pool'].join('/'),
  PAGE_DEPLOY_GAUGE: (network: AppNetworkParams) => [DEX_ROUTES.ROOT(network), 'deploy-gauge'].join('/'),
  PAGE_COMPENSATION: (network: AppNetworkParams) => [DEX_ROUTES.ROOT(network), 'compensation'].join('/'),
} as const

export const LEND_ROUTES = {
  ...sharedRoutes('lend'),
  PAGE_MARKETS: (network: AppNetworkParams) => [LEND_ROUTES.ROOT(network), 'markets'].join('/'),
} as const

export const LEND_MARKET_ROUTES = {
  PAGE_LOAN: ({ marketId, ...network }: AppNetworkParams & { marketId: Address }) =>
    [LEND_ROUTES.ROOT(network), 'markets', marketId].join('/'),
  PAGE_VAULT: ({ marketId, ...network }: AppNetworkParams & { marketId: Address }) =>
    [LEND_ROUTES.ROOT(network), 'markets', marketId, 'vault'].join('/'),
} as const

export const CRVUSD_ROUTES = {
  ...sharedRoutes('crvusd'),
  PAGE_MARKETS: (network: AppNetworkParams) => [CRVUSD_ROUTES.ROOT(network), 'markets'].join('/'),
  PAGE_MARKET: ({ collateralId, ...network }: AppNetworkParams & { collateralId: string }) =>
    [CRVUSD_ROUTES.ROOT(network), 'markets', collateralId].join('/'),
  PAGE_CRVUSD_STAKING: (network: AppNetworkParams) => [CRVUSD_ROUTES.ROOT(network), 'scrvUSD'].join('/'),
  PAGE_PSR: (network: AppNetworkParams) => [CRVUSD_ROUTES.ROOT(network), 'psr'].join('/'),
} as const

export const LLAMALEND_ROUTES = {
  ...sharedRoutes('llamalend'),
  PAGE_MARKETS: (network: AppNetworkParams) => [LLAMALEND_ROUTES.ROOT(network), 'markets'].join('/'),
} as const

export const DAO_ROUTES = {
  ROOT: () => internalUrl({ app: 'dao', blockchainId: 'ethereum' }),
  PAGE_PROPOSALS: () => [DAO_ROUTES.ROOT(), 'proposals'].join('/'),
  PAGE_PROPOSAL: ({ proposalId }: { proposalId: string }) => [DAO_ROUTES.ROOT(), 'proposals', proposalId].join('/'),
  PAGE_GAUGES: () => [DAO_ROUTES.ROOT(), 'gauges'].join('/'),
  PAGE_GAUGE: ({ gaugeAddress }: { gaugeAddress: Address }) => [DAO_ROUTES.ROOT(), 'gauges', gaugeAddress].join('/'),
  PAGE_VECRV: () => [DAO_ROUTES.ROOT(), 'vecrv'].join('/'),
  PAGE_ANALYTICS: () => [DAO_ROUTES.ROOT(), 'analytics'].join('/'),
  PAGE_USER: ({ userAddress }: { userAddress: Address }) => [DAO_ROUTES.ROOT(), 'user', userAddress].join('/'),
  DISCUSSION: () => EXTERNAL_LINKS.curve.gov,
  PAGE_LEGAL: () => [DAO_ROUTES.ROOT(), 'legal'].join('/'),
  PAGE_INTEGRATIONS: () => [DAO_ROUTES.ROOT(), 'integrations'].join('/'),
} as const

const ANALYTICS_ROUTES = {
  ...sharedRoutes('analytics'),
  PAGE_HOME: (network: AppNetworkParams) => [ANALYTICS_ROUTES.ROOT(network), 'home'].join('/'),
}

export const BRIDGE_ROUTES = {
  ...sharedRoutes('bridge'),
  PAGE_BRIDGES: (network: AppNetworkParams) => BRIDGE_ROUTES.ROOT(network),
}

export const APP_ROUTES = {
  dex: DEX_ROUTES,
  lend: LEND_ROUTES,
  crvusd: CRVUSD_ROUTES,
  llamalend: LLAMALEND_ROUTES,
  dao: DAO_ROUTES,
  analytics: ANALYTICS_ROUTES,
  bridge: BRIDGE_ROUTES,
} as const

export type NavigationItem = {
  app: AppName
  route: (params: AppNetworkParams) => string
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
      { app: 'dex', route: DEX_ROUTES.PAGE_SWAP, label: () => t`Swap` },
      { app: 'dex', route: DEX_ROUTES.PAGE_POOLS, label: () => t`Pools` },
      { app: 'dex', route: DEX_ROUTES.PAGE_CREATE_POOL, label: () => t`Pool Creation` },
    ],
  },
  llamalend: {
    label: 'Llamalend',
    routes: [
      { app: 'llamalend', route: LLAMALEND_ROUTES.PAGE_MARKETS, label: () => t`Markets` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_CRVUSD_STAKING, label: () => t`Savings crvUSD` },
      { app: 'crvusd', route: CRVUSD_ROUTES.PAGE_PSR, label: () => t`Peg Stability Reserves` },
    ],
  },
  dao: {
    label: 'Governance',
    routes: [
      { app: 'dao', route: DAO_ROUTES.PAGE_VECRV, label: () => t`Lock CRV` },
      { app: 'dao', route: DAO_ROUTES.PAGE_PROPOSALS, label: () => t`Proposals` },
      { app: 'dao', route: DAO_ROUTES.PAGE_GAUGES, label: () => t`Gauges` },
      { app: 'dao', route: DAO_ROUTES.PAGE_ANALYTICS, label: () => t`Analytics` },
      { app: 'dao', route: DAO_ROUTES.DISCUSSION, label: () => t`Discussion`, target: '_blank' },
    ],
  },
  bridge: { label: t`Bridge`, routes: [{ app: 'bridge', route: BRIDGE_ROUTES.PAGE_BRIDGES, label: () => t`Bridge` }] },
  analytics: {
    label: 'Analytics',
    routes: [{ app: 'analytics', route: ANALYTICS_ROUTES.PAGE_HOME, label: () => t`Home` }],
  },
}

const removeTrailingSlash = (pathname: string) => pathname.replace(/\/$/, '')

/** Converts a route to a page object, adding href and isActive properties */
export const routeToPage = (
  { route, target, label, matchMode }: NavigationItem,
  { blockchainId, pathname }: { blockchainId: string; pathname: string },
) => {
  const href = route({ blockchainId })
  return {
    href,
    target,
    label: label(),
    isActive:
      // In-page section navigation can normalize the current pathname with a trailing slash.
      matchMode === 'exact' ? removeTrailingSlash(pathname) === removeTrailingSlash(href) : pathname.startsWith(href),
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
