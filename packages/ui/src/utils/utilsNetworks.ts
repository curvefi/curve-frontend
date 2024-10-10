import { Chain } from 'curve-lib'
import { ethers } from 'ethers'

const NETWORK_CONFIG_DEFAULT = {
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

const config = {
  1: {
    network_name: 'ethereum',
    chain_id: 1,
    gasPricesUrl: 'https://api.curve.fi/api/getGas',
    gasPricesDefault: 1,
    layer: 1,
    native_currency_symbol: 'ETH',
    public_rpc_url: `https://eth.drpc.org`,
    explorer_base_url: 'https://etherscan.io/',
    orgUIPath: 'https://classic.curve.fi',
  },
  10: {
    network_name: 'optimism',
    chain_id: 10,
    gasL2: true,
    public_rpc_url: 'https://optimism.drpc.org',
    native_currency_symbol: 'ETH',
    explorer_base_url: 'https://optimistic.etherscan.io/',
  },
  100: {
    network_name: 'xdai',
    name: 'Gnosis',
    chain_id: 100,
    public_rpc_url: 'https://rpc.gnosischain.com',
    native_currency_symbol: 'XDAI',
    explorer_base_url: 'https://gnosisscan.io/',
    orgUIPath: 'https://xdai.curve.fi',
  },
  1284: {
    network_name: 'moonbeam',
    chain_id: 1284,
    public_rpc_url: 'https://moonbeam.public.blastapi.io',
    native_currency_symbol: 'GLMR',
    explorer_base_url: 'https://moonscan.io/',
    orgUIPath: 'https://moonbeam.curve.fi',
  },
  137: {
    network_name: 'polygon',
    chain_id: 137,
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
    public_rpc_url: 'https://polygon-rpc.com',
    native_currency_symbol: 'MATIC',
    explorer_base_url: 'https://polygonscan.com/',
    orgUIPath: 'https://polygon.curve.fi',
  },
  2222: {
    network_name: 'kava',
    chain_id: 2222,
    gasPricesUnit: 'UKAVA',
    public_rpc_url: 'https://evm.kava.io',
    native_currency_symbol: 'KAVA',
    explorer_base_url: 'https://explorer.kava.io/',
    orgUIPath: 'https://kava.curve.fi',
  },
  250: {
    network_name: 'fantom',
    chain_id: 250,
    public_rpc_url: 'https://rpc.ftm.tools/',
    native_currency_symbol: 'FTM',
    explorer_base_url: 'https://ftmscan.com/',
    orgUIPath: 'https://ftm.curve.fi',
  },
  42161: {
    network_name: 'arbitrum',
    chain_id: 42161,
    public_rpc_url: 'https://arb1.arbitrum.io/rpc',
    native_currency_symbol: 'ETH',
    explorer_base_url: 'https://arbiscan.io/',
    orgUIPath: 'https://arbitrum.curve.fi',
  },
  43114: {
    network_name: 'avalanche',
    chain_id: 43114,
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
    public_rpc_url: 'https://api.avax.network/ext/bc/C/rpc',
    native_currency_symbol: 'AVAX',
    explorer_base_url: 'https://snowscan.xyz/',
    orgUIPath: 'https://avax.curve.fi',
  },
  42220: {
    network_name: 'celo',
    chain_id: 42220,
    public_rpc_url: 'https://forno.celo.org',
    native_currency_symbol: 'CELO',
    explorer_base_url: 'https://celoscan.io/',
    orgUIPath: 'https://celo.curve.fi',
  },
  1313161554: {
    network_name: 'aurora',
    chain_id: 1313161554,
    public_rpc_url: 'https://mainnet.aurora.dev',
    native_currency_symbol: 'aETH',
    explorer_base_url: 'https://aurorascan.dev/',
    orgUIPath: 'https://aurora.curve.fi',
  },
  324: {
    network_name: 'zksync',
    name: 'zkSync Era',
    chain_id: 324,
    public_rpc_url: 'https://mainnet.era.zksync.io',
    native_currency_symbol: 'ETH',
    explorer_base_url: 'https://era.zksync.network/',
  },
  8453: {
    network_name: 'base',
    chain_id: 8453,
    gasL2: true,
    public_rpc_url: 'https://base.drpc.org',
    native_currency_symbol: 'ETH',
    explorer_base_url: 'https://basescan.org/',
  },
  56: {
    network_name: 'bsc',
    chain_id: 56,
    public_rpc_url: 'https://bsc-dataseed1.binance.org/',
    native_currency_symbol: 'BNB',
    explorer_base_url: 'https://bscscan.com/',
  },
  252: {
    network_name: 'fraxtal',
    chain_id: 252,
    public_rpc_url: `https://rpc.frax.com`,
    native_currency_symbol: 'frxETH',
    explorer_base_url: 'https://fraxscan.com/',
  },
  196: {
    network_name: 'x-layer',
    chain_id: 196,
    public_rpc_url: `https://rpc.xlayer.tech`,
    native_currency_symbol: 'OKB',
    explorer_base_url: 'https://www.okx.com/web3/explorer/xlayer/',
  },
  [Chain.Mantle]: {
    network_name: 'mantle',
    chain_id: Chain.Mantle,
    public_rpc_url: `https://rpc.mantle.xyz`,
    native_currency_symbol: 'MNT',
    explorer_base_url: 'https://mantlescan.xyz/',
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

export function getBaseNetworksConfig(chainId: number): BaseConfig {
  const baseConfig = { ...NETWORK_CONFIG_DEFAULT, ...(config[chainId as keyof typeof config] ?? {}) }

  const {
    chain_id,
    explorer_base_url,
    network_name,
    native_currency_symbol,
    public_rpc_url,
    wrapped_native_token,
    ...rest
  } = baseConfig

  return {
    ...rest,
    name: baseConfig.name || formatNetworkName(network_name),
    chainId: chain_id,
    symbol: native_currency_symbol,
    id: network_name, // TODO: remove id or networkId
    networkId: network_name,
    hex: ethers.toQuantity(chain_id),
    imageBaseUrl:
      network_name === 'ethereum'
        ? `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/`
        : `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets-${network_name}/`,
    logoSrc: `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/${network_name}.png`,
    logoSrcDark: `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/chains/${network_name}-dark.png`,
    rpcUrl: public_rpc_url,
    wrappedAddress: wrapped_native_token,
    scanAddressPath: (hash: string) => `${explorer_base_url}address/${hash}`,
    scanTxPath: (hash: string) => `${explorer_base_url}tx/${hash}`,
    scanTokenPath: (hash: string) => `${explorer_base_url}token/${hash}`,
  }
}

function formatNetworkName(network_name: string) {
  const formattedText = network_name.replace(/-./g, (match) => ' ' + match.charAt(1).toUpperCase())
  return formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
}
