import { Chain } from 'curve-ui-kit/src/utils/network'

const NETWORK_BASE_CONFIG_DEFAULT = {
  name: '',
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: '',
  gasPricesDefault: 0,
  orgUIPath: '',
  isTestnet: false,
}

export const NETWORK_BASE_CONFIG = {
  [Chain.Ethereum]: {
    id: 'ethereum',
    chainId: Chain.Ethereum,
    gasPricesUrl: 'https://api.curve.finance/api/getGas',
    gasPricesDefault: 1,
    nativeCurrencySymbol: 'ETH',
    rpcUrl: `https://eth.drpc.org`,
    explorerUrl: 'https://etherscan.io/',
    orgUIPath: 'https://classic.curve.finance',
  },
  [Chain.Optimism]: {
    id: 'optimism',
    chainId: Chain.Optimism,
    gasL2: true,
    rpcUrl: 'https://optimism.drpc.org',
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io/',
  },
  [Chain.Gnosis]: {
    id: 'xdai',
    name: 'Gnosis',
    chainId: Chain.Gnosis,
    rpcUrl: 'https://rpc.gnosischain.com',
    nativeCurrencySymbol: 'XDAI',
    explorerUrl: 'https://gnosisscan.io/',
    orgUIPath: 'https://xdai.curve.finance',
  },
  [Chain.Moonbeam]: {
    id: 'moonbeam',
    chainId: Chain.Moonbeam,
    rpcUrl: 'https://moonbeam.public.blastapi.io',
    nativeCurrencySymbol: 'GLMR',
    explorerUrl: 'https://moonscan.io/',
    orgUIPath: 'https://moonbeam.curve.finance',
  },
  [Chain.Polygon]: {
    id: 'polygon',
    chainId: Chain.Polygon,
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrencySymbol: 'POL',
    explorerUrl: 'https://polygonscan.com/',
    orgUIPath: 'https://polygon.curve.finance',
  },
  [Chain.Kava]: {
    id: 'kava',
    chainId: Chain.Kava,
    gasPricesUnit: 'UKAVA',
    rpcUrl: 'https://evm.kava.io',
    nativeCurrencySymbol: 'KAVA',
    explorerUrl: 'https://explorer.kava.io/',
    orgUIPath: 'https://kava.curve.finance',
  },
  [Chain.Fantom]: {
    id: 'fantom',
    chainId: Chain.Fantom,
    rpcUrl: 'https://rpc.ftm.tools/',
    nativeCurrencySymbol: 'FTM',
    explorerUrl: 'https://ftmscout.com/',
    orgUIPath: 'https://ftm.curve.finance',
  },
  [Chain.Arbitrum]: {
    id: 'arbitrum',
    chainId: Chain.Arbitrum,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://arbiscan.io/',
    orgUIPath: 'https://arbitrum.curve.finance',
  },
  [Chain.Avalanche]: {
    id: 'avalanche',
    chainId: Chain.Avalanche,
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    nativeCurrencySymbol: 'AVAX',
    explorerUrl: 'https://snowscan.xyz/',
    orgUIPath: 'https://avax.curve.finance',
  },
  [Chain.Celo]: {
    id: 'celo',
    chainId: Chain.Celo,
    rpcUrl: 'https://forno.celo.org',
    nativeCurrencySymbol: 'CELO',
    explorerUrl: 'https://celoscan.io/',
    orgUIPath: 'https://celo.curve.finance',
  },
  [Chain.Aurora]: {
    id: 'aurora',
    chainId: Chain.Aurora,
    rpcUrl: 'https://mainnet.aurora.dev',
    nativeCurrencySymbol: 'aETH',
    explorerUrl: 'https://aurorascan.dev/',
    orgUIPath: 'https://aurora.curve.finance',
  },
  [Chain.ZkSync]: {
    id: 'zksync',
    name: 'zkSync Era',
    chainId: Chain.ZkSync,
    rpcUrl: 'https://mainnet.era.zksync.io',
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://era.zksync.network/',
  },
  [Chain.Base]: {
    id: 'base',
    chainId: Chain.Base,
    gasL2: true,
    rpcUrl: 'https://base.drpc.org',
    nativeCurrencySymbol: 'ETH',
    explorerUrl: 'https://basescan.org/',
  },
  [Chain.Bsc]: {
    id: 'bsc',
    chainId: Chain.Bsc,
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    nativeCurrencySymbol: 'BNB',
    explorerUrl: 'https://bscscan.com/',
  },
  [Chain.Fraxtal]: {
    id: 'fraxtal',
    chainId: Chain.Fraxtal,
    rpcUrl: `https://rpc.frax.com`,
    nativeCurrencySymbol: 'frxETH',
    explorerUrl: 'https://fraxscan.com/',
  },
  [Chain.XLayer]: {
    id: 'x-layer',
    chainId: Chain.XLayer,
    rpcUrl: `https://rpc.xlayer.tech`,
    nativeCurrencySymbol: 'OKB',
    explorerUrl: 'https://www.okx.com/web3/explorer/xlayer/',
  },
  [Chain.Mantle]: {
    id: 'mantle',
    chainId: Chain.Mantle,
    rpcUrl: `https://rpc.mantle.xyz`,
    nativeCurrencySymbol: 'MNT',
    explorerUrl: 'https://mantlescan.xyz/',
  },
  [Chain.Sonic]: {
    id: 'sonic',
    chainId: Chain.Sonic,
    rpcUrl: `https://rpc.soniclabs.com`,
    nativeCurrencySymbol: 'S',
    explorerUrl: 'https://sonicscan.org/',
  },
  [Chain.Hyperliquid]: {
    id: 'hyperliquid',
    chainId: Chain.Hyperliquid,
    rpcUrl: `https://rpc.hyperliquid.xyz/evm`,
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
  rpcUrl: string
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
  orgUIPath: string
}

export function getBaseNetworksConfig<TId extends string, ChainId extends number>(
  chainId: ChainId,
  networkConfig: {
    nativeCurrencySymbol: string
    explorerUrl: string
    rpcUrl: string
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
  const formattedText = id.replace(/[-_]./g, (match) => ' ' + match.charAt(1).toUpperCase())
  return formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
}

// Config parameter is nullable because some networks may not be loaded (e.g., lite networks are unavailable in the DAO app)
export const scanAddressPath = (config: BaseConfig | undefined, hash: string) =>
  config && `${config.explorerUrl}address/${hash}`
export const scanTxPath = (config: BaseConfig | undefined, hash: string) => config && `${config.explorerUrl}tx/${hash}`
export const scanTokenPath = (config: BaseConfig | undefined, hash: string) =>
  config && `${config.explorerUrl}token/${hash}`
