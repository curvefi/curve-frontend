import {
  getChainName,
  isChainConfigured,
  isLiteChain,
  isTestnet,
} from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { NetworkDef, NetworkMapping } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'
import { recordValues } from '@primitives/objects.utils'
import { PAGE_INTEGRATIONS, PAGE_LEGAL } from '@ui/features/layout/routes'
import type { ChainListOption } from '@ui/features/layout/switch-chain/ChainList'
import { t } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'

export { replaceNetworkInPath } from '@ui/features/layout/routes'

export const AppNames = ['dex', 'lend', 'crvusd', 'dao', 'llamalend', 'bridge', 'analytics'] as const
export type AppName = (typeof AppNames)[number]
export type AppMenuOption = 'dex' | 'llamalend' | 'dao' | 'bridge' | 'analytics'

type NetworkParams = { app: AppName; blockchainId: string }

const internalUrl = ({ app, blockchainId }: NetworkParams) => `/${app}/${blockchainId}`

export const SHARED_ROUTES = {
  PAGE_LEGAL: (network: NetworkParams) => `${internalUrl(network)}${PAGE_LEGAL}`,
  PAGE_INTEGRATIONS: (network: NetworkParams) => `${internalUrl(network)}${PAGE_INTEGRATIONS}`,
} as const

export const DEX_ROUTES = {
  PAGE_SWAP: ({ from, to, ...network }: NetworkParams & { from?: Address; to?: Address }) => {
    const query = new URLSearchParams({ ...(from && { from }), ...(to && { to }) }).toString()
    return `${internalUrl(network)}/swap${query ? `?${query}` : ''}`
  },
  PAGE_POOLS: (network: NetworkParams) => `${internalUrl(network)}/pools`,
  PAGE_POOL: ({ poolAddress, ...network }: NetworkParams & { poolAddress: Address }) =>
    `${internalUrl(network)}/pools/${poolAddress}`,
  PAGE_MANAGE_POOL: ({ poolAddress, ...network }: NetworkParams & { poolAddress: Address }) =>
    `${internalUrl(network)}/pools/${poolAddress}/manage-pool`,
  PAGE_CREATE_POOL: (network: NetworkParams) => `${internalUrl(network)}/create-pool`,
  PAGE_DEPLOY_GAUGE: (network: NetworkParams) => `${internalUrl(network)}/deploy-gauge`,
  PAGE_COMPENSATION: (network: NetworkParams) => `${internalUrl(network)}/compensation`,
  ...SHARED_ROUTES,
} as const

export const LEND_ROUTES = {
  PAGE_MARKETS: (network: NetworkParams) => `${internalUrl(network)}/markets`,
  ...SHARED_ROUTES,
} as const

export const LEND_MARKET_ROUTES = {
  PAGE_LOAN: ({ marketId, ...network }: NetworkParams & { marketId: Address }) =>
    `${internalUrl(network)}/markets/${marketId}`,
  PAGE_VAULT: ({ marketId, ...network }: NetworkParams & { marketId: Address }) =>
    `${internalUrl(network)}/markets/${marketId}/vault`,
} as const

export const CRVUSD_ROUTES = {
  PAGE_MARKETS: (network: NetworkParams) => `${internalUrl(network)}/markets`,
  PAGE_MARKET: ({ collateralId, ...network }: NetworkParams & { collateralId: string }) =>
    `${internalUrl(network)}/markets/${collateralId}`,
  PAGE_CRVUSD_STAKING: (network: NetworkParams) => `${internalUrl(network)}/scrvUSD`,
  PAGE_PSR: (network: NetworkParams) => `${internalUrl(network)}/psr`,
  ...SHARED_ROUTES,
} as const

export const LLAMALEND_ROUTES = {
  PAGE_MARKETS: (network: NetworkParams) => `${internalUrl(network)}/markets`,
  ...SHARED_ROUTES,
} as const

export const DAO_ROUTES = {
  PAGE_PROPOSALS: (network: NetworkParams) => `${internalUrl(network)}/proposals`,
  PAGE_PROPOSAL: ({ proposalId, ...network }: NetworkParams & { proposalId: string }) =>
    `${internalUrl(network)}/proposals/${proposalId}`,
  PAGE_GAUGES: (network: NetworkParams) => `${internalUrl(network)}/gauges`,
  PAGE_GAUGE: ({ gaugeAddress, ...network }: NetworkParams & { gaugeAddress: Address }) =>
    `${internalUrl(network)}/gauges/${gaugeAddress}`,
  PAGE_VECRV: (network: NetworkParams) => `${internalUrl(network)}/vecrv`,
  PAGE_ANALYTICS: (network: NetworkParams) => `${internalUrl(network)}/analytics`,
  PAGE_USER: ({ userAddress, ...network }: NetworkParams & { userAddress: Address }) =>
    `${internalUrl(network)}/user/${userAddress}`,
  DISCUSSION: () => EXTERNAL_LINKS.curve.gov,
  ...SHARED_ROUTES,
} as const

const ANALYTICS_ROUTES = { PAGE_HOME: (network: NetworkParams) => `${internalUrl(network)}/home` }

export const BRIDGE_ROUTES = { PAGE_BRIDGES: (network: NetworkParams) => internalUrl(network) }

export type NavigationItem = {
  app: AppName
  route: (params: NetworkParams) => string
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
  { route, target, label, app, matchMode }: NavigationItem,
  { blockchainId, pathname }: { blockchainId: string; pathname: string },
) => {
  const href = route({ app, blockchainId })
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
