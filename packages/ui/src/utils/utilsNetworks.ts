import { Chain } from 'curve-lib'
import { ethers } from 'ethers'

const NETWORK_BASE_CONFIG_DEFAULT = {
  blocknativeSupport: true,
  name: '',
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: '',
  gasPricesDefault: 0,
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
  layer: 2,
  native_currency_coingecko_id: '',
  platform_coingecko_id: '',
  wrapped_native_token: '',
  orgUIPath: '',
}

export const NETWORK_BASE_CONFIG: Record<number, any> = {
  [Chain.Ethereum]: {
    id: 'ethereum',
    chainId: Chain.Ethereum,
    gasPricesUrl: 'https://api.curve.fi/api/getGas',
    gasPricesDefault: 1,
    layer: 1,
    native_currency_symbol: 'ETH',
    rpcUrl: `https://eth.drpc.org`,
    explorerUrl: 'https://etherscan.io/',
    orgUIPath: 'https://classic.curve.fi',
  },
  [Chain.Optimism]: {
    id: 'optimism',
    chainId: Chain.Optimism,
    gasL2: true,
    rpcUrl: 'https://optimism.drpc.org',
    native_currency_symbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io/',
  },
  [Chain.Gnosis]: {
    id: 'xdai',
    name: 'Gnosis',
    chainId: Chain.Gnosis,
    rpcUrl: 'https://rpc.gnosischain.com',
    native_currency_symbol: 'XDAI',
    explorerUrl: 'https://gnosisscan.io/',
    orgUIPath: 'https://xdai.curve.fi',
  },
  [Chain.Moonbeam]: {
    id: 'moonbeam',
    chainId: Chain.Moonbeam,
    rpcUrl: 'https://moonbeam.public.blastapi.io',
    native_currency_symbol: 'GLMR',
    explorerUrl: 'https://moonscan.io/',
    orgUIPath: 'https://moonbeam.curve.fi',
  },
  [Chain.Polygon]: {
    id: 'polygon',
    chainId: Chain.Polygon,
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
    rpcUrl: 'https://polygon-rpc.com',
    native_currency_symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com/',
    orgUIPath: 'https://polygon.curve.fi',
  },
  [Chain.Kava]: {
    id: 'kava',
    chainId: Chain.Kava,
    gasPricesUnit: 'UKAVA',
    rpcUrl: 'https://evm.kava.io',
    native_currency_symbol: 'KAVA',
    explorerUrl: 'https://explorer.kava.io/',
    orgUIPath: 'https://kava.curve.fi',
  },
  [Chain.Fantom]: {
    id: 'fantom',
    chainId: Chain.Fantom,
    rpcUrl: 'https://rpc.ftm.tools/',
    native_currency_symbol: 'FTM',
    explorerUrl: 'https://ftmscan.com/',
    orgUIPath: 'https://ftm.curve.fi',
  },
  [Chain.Arbitrum]: {
    id: 'arbitrum',
    chainId: Chain.Arbitrum,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    native_currency_symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io/',
    orgUIPath: 'https://arbitrum.curve.fi',
  },
  [Chain.Avalanche]: {
    id: 'avalanche',
    chainId: Chain.Avalanche,
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    native_currency_symbol: 'AVAX',
    explorerUrl: 'https://snowscan.xyz/',
    orgUIPath: 'https://avax.curve.fi',
  },
  [Chain.Celo]: {
    id: 'celo',
    chainId: Chain.Celo,
    rpcUrl: 'https://forno.celo.org',
    native_currency_symbol: 'CELO',
    explorerUrl: 'https://celoscan.io/',
    orgUIPath: 'https://celo.curve.fi',
  },
  [Chain.Aurora]: {
    id: 'aurora',
    chainId: Chain.Aurora,
    rpcUrl: 'https://mainnet.aurora.dev',
    native_currency_symbol: 'aETH',
    explorerUrl: 'https://aurorascan.dev/',
    orgUIPath: 'https://aurora.curve.fi',
  },
  [Chain.ZkSync]: {
    id: 'zksync',
    name: 'zkSync Era',
    chainId: Chain.ZkSync,
    rpcUrl: 'https://mainnet.era.zksync.io',
    native_currency_symbol: 'ETH',
    explorerUrl: 'https://era.zksync.network/',
  },
  [Chain.Base]: {
    id: 'base',
    chainId: Chain.Base,
    gasL2: true,
    rpcUrl: 'https://base.drpc.org',
    native_currency_symbol: 'ETH',
    explorerUrl: 'https://basescan.org/',
  },
  [Chain.Bsc]: {
    id: 'bsc',
    chainId: Chain.Bsc,
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    native_currency_symbol: 'BNB',
    explorerUrl: 'https://bscscan.com/',
  },
  [Chain.Fraxtal]: {
    id: 'fraxtal',
    chainId: Chain.Fraxtal,
    rpcUrl: `https://rpc.frax.com`,
    native_currency_symbol: 'frxETH',
    explorerUrl: 'https://fraxscan.com/',
  },
  [Chain.XLayer]: {
    id: 'x-layer',
    chainId: Chain.XLayer,
    rpcUrl: `https://rpc.xlayer.tech`,
    native_currency_symbol: 'OKB',
    explorerUrl: 'https://www.okx.com/web3/explorer/xlayer/',
  },
  [Chain.Mantle]: {
    id: 'mantle',
    chainId: Chain.Mantle,
    rpcUrl: `https://rpc.mantle.xyz`,
    native_currency_symbol: 'MNT',
    explorerUrl: 'https://mantlescan.xyz/',
  },
}

export type BaseConfig = {
  id: string
  name: string
  chainId: number
  symbol: string
  networkId: string
  hex: string
  blocknativeSupport: boolean
  gasL2: boolean
  gasPricesUnit: string
  gasPricesUrl: string
  gasPricesDefault: number
  logoSrc: string
  logoSrcDark: string
  integrations: { imageBaseurl: string; listUrl: string; tagsUrl: string }
  rewards: { baseUrl: string; imageBaseUrl: string; campaignsUrl: string; tagsUrl: string }
  rpcUrl: string
  imageBaseUrl: string
  wrappedAddress: string
  scanAddressPath: (hash: string) => string
  scanTxPath: (hash: string) => string
  scanTokenPath: (hash: string) => string
  orgUIPath: string
}

export function getBaseNetworksConfig(chainId: number, networkConfig: any): BaseConfig {
  const config = { ...NETWORK_BASE_CONFIG_DEFAULT, ...networkConfig }
  const { name, explorerUrl, id, native_currency_symbol, rpcUrl, wrapped_native_token, ...rest } = config

  return {
    ...rest,
    name: formatNetworkName(name || id),
    chainId,
    symbol: native_currency_symbol,
    id: id, // TODO: remove id or networkId
    networkId: id,
    hex: ethers.toQuantity(chainId),
    imageBaseUrl:
      id === 'ethereum'
        ? `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/`
        : `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets-${id}/`,
    logoSrc: `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/${id}.png`,
    logoSrcDark: `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/${id}-dark.png`,
    rpcUrl: rpcUrl,
    wrappedAddress: wrapped_native_token,
    scanAddressPath: (hash: string) => `${explorerUrl}address/${hash}`,
    scanTxPath: (hash: string) => `${explorerUrl}tx/${hash}`,
    scanTokenPath: (hash: string) => `${explorerUrl}token/${hash}`,
  }
}

function formatNetworkName(id: string) {
  const formattedText = id.replace(/[-_]./g, (match) => ' ' + match.charAt(1).toUpperCase())
  return formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
}
