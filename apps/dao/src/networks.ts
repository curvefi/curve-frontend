import sortBy from 'lodash/sortBy'

import curvejsApi from '@/lib/curvejs'
import { RCEthereumLogo } from '@/ui/images'

const CURVE_IMAGE_ASSETS_BASE_PATH = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'

const isDevelopment = process.env.NODE_ENV === 'development'

const NETWORK_CONFIG_DEFAULT = {
  api: curvejsApi,
  blocknativeSupport: true,
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: 'https://api.curve.fi/api/getGas',
  gasPricesDefault: 0,
  showInSelectNetwork: true,
}

const networks: Record<ChainId, NetworkConfig> = {
  1: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Ethereum',
    id: 'ethereum',
    gasPricesDefault: 1,
    hex: '0x1',
    icon: RCEthereumLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets/`,
    networkId: 1,
    orgUIPath: 'https://classic.curve.fi',
    rpcUrlConnectWallet: `https://eth.drpc.org`,
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_ETHEREUM_DEV_RPC_URL!
      : `https://curve.drpc.org/ogrpc?network=ethereum`,
    symbol: 'ETH',
    logoSrc: `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/${id}.png`,
    logoSrcDark: `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/${id}-dark.png`,
    scanAddressPath: (hash: string) => `https://etherscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://etherscan.com/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://etherscan.io/token/${hash}`,
  },
}

export const networksIdMapper = Object.keys(networks).reduce(
  (prev, curr: unknown) => {
    const networkConfig = networks[curr as ChainId]
    prev[networkConfig.id] = networkConfig.networkId
    return prev
  },
  {} as Record<NetworkEnum, ChainId>,
)

export const visibleNetworksList = sortBy(
  Object.keys(networks)
    .filter((chainId) => networks[+chainId as ChainId].showInSelectNetwork)
    .map((chainId: unknown) => {
      const networkConfig = networks[chainId as ChainId]
      return { icon: networkConfig.icon, label: networkConfig.name, chainId: networkConfig.networkId }
    }),
  (n) => n.label,
)

export default networks
