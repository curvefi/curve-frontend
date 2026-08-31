import { Chain } from '@evm-ui/utils/network'

const NETWORK_BASE_CONFIG_DEFAULT = {
  name: '',
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: '',
  gasPricesDefault: 0,
  isTestnet: false,
}

export const NETWORK_BASE_CONFIG = {
  [Chain.Ethereum]: {
    id: 'ethereum',
    gasPricesUrl: 'https://api.curve.finance/api/getGas',
    gasPricesDefault: 1,
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://etherscan.io/',
  },
  [Chain.Optimism]: {
    id: 'optimism',
    gasL2: true,
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io/',
  },
  [Chain.Gnosis]: {
    id: 'xdai',
    name: 'Gnosis',
    nativeCurrencySymbol: 'XDAI',
    explorerUrl: 'https://gnosisscan.io/',
  },
  [Chain.Moonbeam]: {
    id: 'moonbeam',
    nativeCurrencySymbol: 'GLMR',
    explorerUrl: 'https://moonscan.io/',
  },
  [Chain.Polygon]: {
    id: 'polygon',
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
    nativeCurrencySymbol: 'POL',
    explorerUrl: 'https://polygonscan.com/',
  },
  [Chain.Kava]: {
    id: 'kava',
    gasPricesUnit: 'UKAVA',
    nativeCurrencySymbol: 'KAVA',
    explorerUrl: 'https://kavascan.io/',
  },
  [Chain.Fantom]: {
    id: 'fantom',
    nativeCurrencySymbol: 'FTM',
    explorerUrl: 'https://ftmscout.com/',
  },
  [Chain.Arbitrum]: {
    id: 'arbitrum',
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://arbiscan.io/',
  },
  [Chain.Avalanche]: {
    id: 'avalanche',
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
    nativeCurrencySymbol: 'AVAX',
    explorerUrl: 'https://snowscan.xyz/',
  },
  [Chain.Celo]: {
    id: 'celo',
    nativeCurrencySymbol: 'CELO',
    explorerUrl: 'https://celoscan.io/',
  },
  [Chain.Aurora]: {
    id: 'aurora',
    nativeCurrencySymbol: 'aETH',
    explorerUrl: 'https://aurorascan.dev/',
  },
  [Chain.ZkSync]: {
    id: 'zksync',
    name: 'zkSync Era',
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://era.zksync.network/',
  },
  [Chain.Base]: {
    id: 'base',
    gasL2: true,
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://basescan.org/',
  },
  [Chain.Bsc]: {
    id: 'bsc',
    nativeCurrencySymbol: 'BNB',
    explorerUrl: 'https://bscscan.com/',
  },
  [Chain.Fraxtal]: {
    id: 'fraxtal',
    nativeCurrencySymbol: 'FRAX',
    explorerUrl: 'https://fraxscan.com/',
  },
  [Chain.XLayer]: {
    id: 'x-layer',
    nativeCurrencySymbol: 'OKB',
    explorerUrl: 'https://www.okx.com/web3/explorer/xlayer/',
  },
  [Chain.Mantle]: {
    id: 'mantle',
    nativeCurrencySymbol: 'MNT',
    explorerUrl: 'https://mantlescan.xyz/',
  },
  [Chain.Sonic]: {
    id: 'sonic',
    nativeCurrencySymbol: 'S',
    explorerUrl: 'https://sonicscan.org/',
  },
  [Chain.Hyperliquid]: {
    id: 'hyperliquid',
    nativeCurrencySymbol: 'HYPE',
    explorerUrl: 'https://hyperevmscan.io/',
  },
} as const

export type NetworkDef<TId extends string = string, TChainId extends number = number> = {
  isLite?: boolean
  id: TId
  name: string
  chainId: TChainId
  explorerUrl: string
  isTestnet: boolean
  symbol: string
  showInSelectNetwork: boolean
  showRouterSwap?: boolean // only for dex
}

export type NetworkMapping<TId extends string = string, TChainId extends number = number> = Record<
  TChainId,
  NetworkDef<TId, TChainId>
>

export type BaseConfig<TId extends string = string, TChainId extends number = number> = NetworkDef<TId, TChainId> & {
  networkId: string
  gasL2: boolean
  gasPricesUnit: string
  gasPricesUrl: string
  gasPricesDefault: number
}

export function getBaseNetworksConfig<TId extends string, ChainId extends number>(
  chainId: ChainId,
  networkConfig: {
    nativeCurrencySymbol: string
    explorerUrl: string
    id: TId
    name?: string
    isTestnet?: boolean
  },
): Omit<BaseConfig<TId>, 'showInSelectNetwork' | 'showRouterSwap'> {
  const { name, id, nativeCurrencySymbol, ...rest } = { ...NETWORK_BASE_CONFIG_DEFAULT, ...networkConfig }
  return {
    ...rest,
    name: formatNetworkName(name || id),
    chainId,
    symbol: nativeCurrencySymbol,
    id, // TODO: remove id or networkId
    networkId: id,
  }
}

/** Capitalizes and separates words in a string by replacing hyphens and underscores with spaces. */
function formatNetworkName(id: string) {
  const formattedText = id.replace(/[-_]./g, match => ' ' + match.charAt(1).toUpperCase())
  return formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
}

// Config parameter is nullable because some networks may not be loaded (e.g., lite networks are unavailable in the DAO app)
export const scanAddressPath = (config: BaseConfig | undefined, hash: string) =>
  config && `${config.explorerUrl}address/${hash}`
export const scanTxPath = (config: BaseConfig | undefined, hash: string) => config && `${config.explorerUrl}tx/${hash}`
export const scanTokenPath = (config: BaseConfig | undefined, hash: string) =>
  config && `${config.explorerUrl}token/${hash}`
