import memoize from 'memoizee'
import { DEFAULT_NETWORK_CONFIG } from '@/dex/constants'
import { ChainId, NetworkConfig, type NetworkEnum, NetworkUrlParams } from '@/dex/types/main.types'
import curve from '@curvefi/api'
import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkDef } from '@ui/utils'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils/utilsNetworks'
import { CRVUSD_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { Chain } from '@ui-kit/utils/network'

export const defaultNetworks = Object.entries({
  [Chain.Ethereum]: {
    excludeTokensBalancesMapper: {
      '0x6b8734ad31d42f5c05a86594314837c416ada984': true,
      '0x29b41fe7d754b8b43d4060bb43734e436b0b9a33': true,
    },
    poolCustomTVL: {
      pax: '0',
      busd: '0',
      y: '0',
    },
    poolIsWrappedOnly: {
      pax: true,
      busd: true,
      y: true,
    },
    missingPools: [
      { name: 'linkusd', url: 'https://classic.curve.finance/linkusd/withdraw' },
      { name: 'tricrypto', url: 'https://classic.curve.finance/tricrypto/withdraw' },
    ],
    swap: {
      fromAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      toAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    excludePoolsMapper: {
      'weth-llamma': true,
      'sfrxeth-llamma': true,
      pax: true,
      busd: true,
      y: true,
      'factory-v2-267': true,
      'factory-v2-332': true, // CRVUSD/STUSDT
      'factory-v2-348': true, // PYUSD/crvUSD
      'factory-v2-349': true, // crvUSD/PYUSD
      'factory-v2-350': true, // crvUSD/PYUSD
      'factory-v2-233': true, // Adamant Dollar
      'factory-stable-ng-13': true, // USDV-3crv
      'factory-stable-ng-21': true, // weETH/WETH
      'factory-v2-370': true, // PRISMA/yPRISMA
    },
    swapCustomRouteRedirect: {
      'sfrxeth-llamma': getInternalUrl('crvusd', 'ethereum', CRVUSD_ROUTES.PAGE_MARKETS),
    },
    createDisabledTokens: [
      '0x075b1bb99792c9e1041ba13afef80c91a1e70fb3',
      '0x051d7e5609917bd9b73f04bac0ded8dd46a74301',
      '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
    ],
    createQuickList: [
      {
        address: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactoryOld: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Optimism]: {
    swap: {
      fromAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      toAddress: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    },
    symbol: 'ETH',
    createQuickList: [
      {
        address: '0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Gnosis]: {
    poolFilters: ['all', 'usd', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
      toAddress: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
    },
    symbol: 'XDAI',
    createQuickList: [
      {
        address: '0xabef652195f98a91e490f047a5006b71c85f058d',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Moonbeam]: {
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0xffffffff1fcacbd218edc0eba20fc2308c778080',
      toAddress: '0xfa36fe1da08c89ec72ea1f0143a35bfd5daea108',
    },
    stableswapFactoryOld: true,
    hasFactory: true,
  },
  [Chain.Polygon]: {
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    missingPools: [
      { name: 'atricrypto', url: 'https://polygon.curve.finance/atricrypto/withdraw' },
      { name: 'atricrypto2', url: 'https://polygon.curve.finance/atricrypto2/withdraw' },
    ],
    swap: {
      fromAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      toAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    },
    createDisabledTokens: ['0x0000000000000000000000000000000000001010'],
    createQuickList: [
      {
        address: '0xc4ce1d6f5d98d65ee25cf85e9f2e9dcfee6cb5d6',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactoryOld: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Kava]: {
    poolFilters: ['all', 'usd', 'btc', 'kava', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0x765277eebeca2e31912c9946eae1021199b39c61',
      toAddress: '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    },
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  [Chain.Fantom]: {
    excludePoolsMapper: {
      'factory-v2-137': true, // old eywa pool
      'factory-v2-140': true, // old eywa pool
      'factory-stable-ng-12': true, // CrossCurve crvUSDT
      'factory-stable-ng-13': true, // CrossCurve
      'factory-stable-ng-14': true, // CrossCurve
      'factory-stable-ng-15': true, // CrossCurve
    },
    excludeTokensBalancesMapper: { '0x618b22e6fddd6870cdfb4146ef2d4bc62efc660a': true },
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'cross-chain', 'others', 'user'],
    swap: {
      fromAddress: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
      toAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    },
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactoryOld: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Arbitrum]: {
    excludeTokensBalancesMapper: { '0x3aef260cb6a5b469f970fae7a1e233dbd5939378': true },
    swap: {
      fromAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      toAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    },
    createQuickList: [
      {
        address: '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Avalanche]: {
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
      toAddress: '0xc7198437980c041c805a1edcba50c1ce5db95118',
    },
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  [Chain.Celo]: {
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0x37f750b7cc259a2f741af45294f6a16572cf5cad',
      toAddress: '0x617f3112bf5397d0467d315cc709ef968d9ba546',
    },
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  [Chain.Aurora]: {
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      toAddress: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
    },
    // stableswapFactory: true, does not support EIP-1559 txs
    twocryptoFactory: true,
    // hasFactory: true,
  },
  [Chain.ZkSync]: {
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    showInSelectNetwork: false,
    stableswapFactory: true,
  },
  [Chain.Base]: {
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludePoolsMapper: {
      'factory-v2-4': true,
      'factory-v2-5': true,
    },
    hideSmallPoolsTvl: 5000,
    swap: {
      fromAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      toAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    },
    createQuickList: [
      {
        address: '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactoryOld: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
    pricesApi: true,
  },
  [Chain.Bsc]: {
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    swap: {
      fromAddress: '0xe9c803f48dffe50180bd5b01dc04da939e3445fc',
      toAddress: '0xcba2aeec821b0b119857a9ab39e09b034249681a',
    },
    createQuickList: [
      {
        address: '0xe2fb3f127f5450dee44afe054385d74c392bdef4',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    stableswapFactoryOld: true,
    stableswapFactory: true,
    twocryptoFactoryOld: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  [Chain.Fraxtal]: {
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'others', 'stableng', 'user'],
    // TODO: use correct address once there is a pool
    swap: {
      fromAddress: '0xb102f7efa0d5de071a8d37b3548e1c7cb148caf3',
      toAddress: '0xfc00000000000000000000000000000000000001',
    },
    createQuickList: [
      {
        address: '0xb102f7efa0d5de071a8d37b3548e1c7cb148caf3',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    pricesApi: true,
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  [Chain.XLayer]: {
    swap: {
      fromAddress: '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
      toAddress: '0x74b7f16337b8972027f6196a17a631ac6de26d22',
    },
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  [Chain.Mantle]: {
    swap: {
      fromAddress: '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae', // USDT
      toAddress: '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9', // USDC
    },
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
}).reduce(
  (prev, [key, config]) => {
    const chainId = Number(key) as ChainId

    prev[chainId] = {
      ...getBaseNetworksConfig<NetworkEnum, ChainId>(
        chainId,
        NETWORK_BASE_CONFIG[chainId as keyof typeof NETWORK_BASE_CONFIG],
      ),
      ...DEFAULT_NETWORK_CONFIG,
      ...config,
      isCrvRewardsEnabled: true,
    } as NetworkConfig
    return prev
  },
  {} as Record<ChainId, NetworkConfig>,
)

export async function getNetworks() {
  const resp = await curve.getCurveLiteNetworks() // returns [] in case of error

  const liteNetworks = Object.values(resp).reduce(
    (prev, { chainId, ...config }) => {
      const isUpgraded = [Chain.Sonic, Chain.Hyperliquid].includes(chainId) // networks upgraded from lite to full
      prev[chainId] = {
        ...getBaseNetworksConfig<NetworkEnum, ChainId>(Number(chainId), config),
        ...DEFAULT_NETWORK_CONFIG,
        ...(isUpgraded && {
          poolFilters: [
            'all',
            'usd',
            'btc',
            'eth',
            'crypto',
            'crvusd',
            'tricrypto',
            'stableng',
            'cross-chain',
            'others',
            'user',
          ],
        }),
        chainId,
        hasFactory: true,
        stableswapFactory: true,
        twocryptoFactory: true,
        tricryptoFactory: true,
        pricesApi: isUpgraded,
        isLite: !isUpgraded,
        isCrvRewardsEnabled: isUpgraded,
        isTestnet: config.isTestnet,
      }
      return prev
    },
    {} as Record<number, NetworkConfig>,
  )

  return { ...defaultNetworks, ...liteNetworks }
}

/**
 * Strip out functions from the network config so they can be passed from server to client
 */
const createNetworkDef = ({
  id,
  name,
  chainId,
  explorerUrl,
  isTestnet,
  symbol,
  rpcUrl,
  showInSelectNetwork,
}: NetworkConfig): NetworkDef<NetworkEnum, ChainId> => ({
  id: id as NetworkEnum,
  name,
  chainId: chainId as ChainId,
  explorerUrl,
  isTestnet,
  symbol,
  rpcUrl,
  showInSelectNetwork,
})

export const getNetworkDefs = memoize(
  async () =>
    fromEntries(
      recordValues(await getNetworks())
        .map(createNetworkDef)
        .map((def) => [def.chainId, def] as const),
    ),
  { maxAge: 5 * 60 * 1000, promise: true, preFetch: true },
)

export const getNetworkDef = async ({
  network,
}: NetworkUrlParams): Promise<NetworkDef<NetworkEnum, ChainId> | undefined> => {
  const config = recordValues(await getNetworks()).find((n) => n.id === network)
  return config && createNetworkDef(config)
}

export const getChainId = async ({ network }: NetworkUrlParams): Promise<number | undefined> => {
  const find = recordValues(await getNetworks()).find((n) => n.id === network)
  return find?.chainId
}
