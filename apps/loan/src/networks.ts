import sortBy from 'lodash/sortBy'

import { ASSETS_BASE_PATH } from '@/constants'
import { RCEthereumLogo } from '@/ui/images'
import curvejsApi from '@/lib/apiCrvusd'

const isDevelopment = process.env.NODE_ENV === 'development'

const DEFAULT_NETWORK_CONFIG = {
  api: curvejsApi,
  blocknativeSupport: true,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: 'https://api.curve.fi/api/getGas',
  gasPricesDefault: 1,
  orgUIPath: 'https://curve.fi',
  integrations: {
    imageBaseurl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/platforms',
    listUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-integrations/integrations-list.json',
    tagsUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-integrations/integrations-tags.json',
  },
  showInSelectNetwork: true,
}

const networks: Record<ChainId, NetworkConfig> = {
  1: {
    ...DEFAULT_NETWORK_CONFIG,
    name: 'Ethereum',
    id: 'ethereum',
    hex: '0x1',
    icon: RCEthereumLogo,
    imageBaseUrl: `${ASSETS_BASE_PATH}/images/assets/`,
    networkId: 1,
    rpcUrlConnectWallet: `https://eth.drpc.org`,
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_ETHEREUM_DEV_RPC_URL!
      : `https://curve.drpc.org/ogrpc?network=ethereum`,
    symbol: 'ETH',
    scanAddressPath: (hash: string) => `https://etherscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://etherscan.com/tx/${hash}`,
  },
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
