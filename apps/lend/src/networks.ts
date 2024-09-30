import sortBy from 'lodash/sortBy'

import { baseNetworksConfig } from '@/ui/utils'

const isDevelopment = process.env.NODE_ENV === 'development'
const drpcUrl = (network: string) =>
  `https://lb.drpc.org/ogrpc?network=${network}&dkey=${process.env.NEXT_PUBLIC_FRONTEND_DRPC_KEY}`

const DEFAULT_NETWORK_CONFIG = {
  blocknativeSupport: true,
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: 'https://api.curve.fi/api/getGas',
  gasPricesDefault: 1,
  hideMarketsInUI: {},
  smallMarketAmount: 10000,
  marketListFilter: ['all', 'leverage', 'user'],
  marketListFilterType: ['borrow', 'lend'],
  marketListShowOnlyInSmallMarkets: {},
  orgUIPath: 'https://classic.curve.fi',
  integrations: {
    imageBaseurl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/platforms',
    listUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-integrations/integrations-list.json',
    tagsUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-integrations/integrations-tags.json',
  },
  rewards: {
    baseUrl: 'https://cdn.jsdelivr.net',
    imageBaseUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/platforms',
    campaignsUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-reward@latest/campaign-list.json',
    tagsUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-reward@latest/reward-tags.json',
  },
  showInSelectNetwork: false,
  pricesData: false,
}

const networks: Record<ChainId, NetworkConfig> = {
  1: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['1'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_ETHEREUM_DEV_RPC_URL! : drpcUrl('ethereum'),
    hideMarketsInUI: { 'one-way-market-19': true },
    showInSelectNetwork: true,
    pricesData: true,
  },
  10: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['10'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_OPTIMISM_DEV_RPC_URL! : drpcUrl('optimism'),
    showInSelectNetwork: true,
    pricesData: true,
  },
   252: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['252'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_FRAXTAL_DEV_RPC_URL! : drpcUrl('fraxtal'),
    showInSelectNetwork: true,
    pricesData: true,
  },
 100: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['100'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_GNOSIS_DEV_RPC_URL! : 'https://rpc.gnosischain.com',
    isActiveNetwork: false,
  },
  1284: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['1284'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_MOONBEAM_DEV_RPC_URL! : 'https://moonbeam.public.blastapi.io',
    isActiveNetwork: false,
  },
  137: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['137'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_POLYGON_DEV_RPC_URL! : drpcUrl('polygon'),
    isActiveNetwork: false,
  },
  2222: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['2222'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_KAVA_DEV_RPC_URL! : 'https://evm.kava.io',
    isActiveNetwork: false,
  },
  250: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['250'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_FANTOM_DEV_RPC_URL! : 'https://rpc.ftm.tools/',
    isActiveNetwork: false,
  },
  42161: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['42161'],
    showInSelectNetwork: true,
    marketListShowOnlyInSmallMarkets: { 'one-way-market-7': true },
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_ARBITRUM_DEV_RPC_URL! : drpcUrl('arbitrum'),
    pricesData: true,
  },
  43114: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['43114'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_AVALANCHE_DEV_RPC_URL! : 'https://api.avax.network/ext/bc/C/rpc',
    isActiveNetwork: false,
  },
  42220: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['42220'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_CELO_DEV_RPC_URL! : 'https://forno.celo.org',
    isActiveNetwork: false,
  },
  1313161554: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['1313161554'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_AURORA_DEV_RPC_URL! : 'https://mainnet.aurora.dev',
    isActiveNetwork: false,
  },
  324: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['324'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_ZKSYNC_DEV_RPC_URL! : 'https://mainnet.era.zksync.io',
    isActiveNetwork: false,
  },
  8453: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['8453'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BASE_DEV_RPC_URL! : drpcUrl('base'),
    isActiveNetwork: false,
  },
  56: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['56'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BSC_DEV_RPC_URL! : drpcUrl('bsc'),
    isActiveNetwork: false,
  },
  196: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['196'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BASE_DEV_RPC_URL! : drpcUrl('base'),
    isActiveNetwork: false,
  },
  5000: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['5000'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BASE_DEV_RPC_URL! : drpcUrl('mantle'),
    isActiveNetwork: false,
  }
}

export const networksIdMapper = Object.keys(networks).reduce((prev, chainId: unknown) => {
  const networkConfig = networks[chainId as ChainId]
  prev[networkConfig.id] = networkConfig.networkId
  return prev
}, {} as Record<NetworkEnum, ChainId>)

export const visibleNetworksList = sortBy(
  Object.keys(networks)
    .filter((chainId) => networks[+chainId as ChainId].showInSelectNetwork)
    .map((chainId: unknown) => {
      const networkConfig = networks[chainId as ChainId]
      return { icon: networkConfig.icon, label: networkConfig.name, chainId: networkConfig.networkId }
    }),
  (n) => n.label
)

export default networks
