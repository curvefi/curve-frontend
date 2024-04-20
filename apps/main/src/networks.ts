import sortBy from 'lodash/sortBy'

import { ROUTE } from '@/constants'
import { baseNetworksConfig } from '@/ui/utils'
import curvejsApi from '@/lib/curvejs'

const isDevelopment = process.env.NODE_ENV === 'development'

const NETWORK_CONFIG_DEFAULT = {
  api: curvejsApi,
  compensations: {},
  customPoolIds: {}, // remove pools from pool list
  ethTokenAddress: {},
  excludeRoutes: [],
  excludeGetUserBalancesTokens: [],
  forms: [
    'SWAP',
    'SWAP_REQUIRED',
    'DEPOSIT',
    'DEPOSIT_STAKE',
    'STAKE',
    'WITHDRAW.token',
    'WITHDRAW.lpToken',
    'WITHDRAW.imbalance',
    'DASHBOARD',
    'BOOSTING',
    'LOCKER',
  ],
  hidePoolRewards: {},
  hideSmallPoolsTvl: 10000,
  missingPools: [],
  poolCustomTVL: {}, // hardcode tvl for pool
  poolIsWrappedOnly: {}, // show only wrapped pool data
  poolListFormValuesDefault: {},
  swap: { fromAddress: '', toAddress: '' },
  swapCustomRouteRedirect: {},
  showInSelectNetwork: true,
  showHideSmallPoolsCheckbox: false,
  createQuickList: [],
  createDisabledTokens: [],
  stableswapFactory: false, // determines support in pool creation and gauge deployment
  stableswapFactoryOld: false, // determines support in pool creation and gauge deployment
  twocryptoFactoryOld: false, // determines support in pool creation and gauge deployment
  twocryptoFactory: false, // determines support in pool creation and gauge deployment
  tricryptoFactory: false, // determines support in pool creation and gauge deployment
  hasFactory: false,
  pricesApi: false,
}

const networks: Record<ChainId, NetworkConfig> = {
  1: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['1'],
    compensations: {
      crveth: true,
      'factory-v2-38': true, // alETH,
      'factory-v2-194': true, // pETH,
      'factory-v2-252': true, // msETH
    },
    excludeGetUserBalancesTokens: [
      '0x6b8734ad31d42f5c05a86594314837c416ada984',
      '0x29b41fe7d754b8b43d4060bb43734e436b0b9a33',
    ],
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
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'stableng', 'others', 'user'],
    hidePoolRewards: {
      crveth: true,
      'factory-v2-38': true,
      'factory-v2-252': true,
      'factory-v2-194': true,
      'factory-v2-56': true, // Ankr Reward-Earning Staked ETH
    },
    missingPools: [
      { name: 'linkusd', url: 'https://classic.curve.fi/linkusd/withdraw' },
      { name: 'tricrypto', url: 'https://classic.curve.fi/tricrypto/withdraw' },
    ],
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_ETHEREUM_DEV_RPC_URL!
      : `https://curve.drpc.org/ogrpc?network=ethereum`,
    swap: {
      fromAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      toAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    customPoolIds: {
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
      'sfrxeth-llamma': 'https://crvusd.curve.fi/',
    },
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
  10: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['10'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_OPTIMISM_DEV_RPC_URL!
      : 'https://curve.drpc.org/ogrpc?network=optimism',
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
  100: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['100'],
    poolFilters: ['all', 'usd', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_GNOSIS_DEV_RPC_URL! : 'https://rpc.gnosischain.com',
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
  },
  1284: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['1284'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_MOONBEAM_DEV_RPC_URL! : 'https://moonbeam.public.blastapi.io',
    swap: {
      fromAddress: '0xffffffff1fcacbd218edc0eba20fc2308c778080',
      toAddress: '0xfa36fe1da08c89ec72ea1f0143a35bfd5daea108',
    },
    stableswapFactoryOld: true,
    hasFactory: true,
  },
  137: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['137'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    missingPools: [
      { name: 'atricrypto', url: 'https://polygon.curve.fi/atricrypto/withdraw' },
      { name: 'atricrypto2', url: 'https://polygon.curve.fi/atricrypto2/withdraw' },
    ],
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_POLYGON_DEV_RPC_URL!
      : 'https://curve.drpc.org/ogrpc?network=polygon',
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
  2222: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['2222'],
    poolFilters: ['all', 'usd', 'btc', 'kava', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    poolListFormValuesDefault: { hideSmallPools: false }, // remove if Kava have > 10 pools
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_KAVA_DEV_RPC_URL! : 'https://evm.kava.io',
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
  250: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['250'],
    customPoolIds: {
      'factory-v2-137': true, // old eywa pool
      'factory-v2-140': true, // old eywa pool
      'factory-stable-ng-12': true, // CrossCurve crvUSDT
      'factory-stable-ng-13': true, // CrossCurve
      'factory-stable-ng-14': true, // CrossCurve
      'factory-stable-ng-15': true, // CrossCurve
    },
    excludeGetUserBalancesTokens: ['0x618b22e6fddd6870cdfb4146ef2d4bc62efc660a'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'cross-chain', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_FANTOM_DEV_RPC_URL! : 'https://rpc.ftm.tools/',
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
  42161: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['42161'],
    excludeGetUserBalancesTokens: ['0x3aef260cb6a5b469f970fae7a1e233dbd5939378'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    hidePoolRewards: { tricrypto: true },
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_ARBITRUM_DEV_RPC_URL!
      : 'https://curve.drpc.org/ogrpc?network=arbitrum',
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
  43114: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['43114'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_AVALANCHE_DEV_RPC_URL! : 'https://api.avax.network/ext/bc/C/rpc',
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
  42220: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['42220'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_CELO_DEV_RPC_URL! : 'https://forno.celo.org',
    swap: {
      fromAddress: '0x37f750b7cc259a2f741af45294f6a16572cf5cad',
      toAddress: '0x617f3112bf5397d0467d315cc709ef968d9ba546',
    },
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
  1313161554: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['1313161554'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_AURORA_DEV_RPC_URL! : 'https://mainnet.aurora.dev',
    swap: {
      fromAddress: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      toAddress: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
    },
    // stableswapFactory: true, does not support EIP-1559 txs
    twocryptoFactory: true,
    // hasFactory: true,
  },
  324: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['324'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_ZKSYNC_DEV_RPC_URL! : 'https://mainnet.era.zksync.io',
    showInSelectNetwork: false,
    stableswapFactory: true,
  },
  8453: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['8453'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER' && f !== 'SWAP_REQUIRED'
    }),
    customPoolIds: { 'factory-v2-4': true, 'factory-v2-5': true },
    hideSmallPoolsTvl: 5000,
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BASE_DEV_RPC_URL! : 'https://curve.drpc.org/ogrpc?network=base',
    showHideSmallPoolsCheckbox: true,
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
  56: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['56'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'tricrypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER' && f !== 'SWAP_REQUIRED'
    }),
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BSC_DEV_RPC_URL! : 'https://curve.drpc.org/ogrpc?network=bsc',
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
  252: {
    ...NETWORK_CONFIG_DEFAULT,
    ...baseNetworksConfig['252'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'others', 'stableng', 'user'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_FRAXTAL_DEV_RPC_URL! : `https://rpc.frax.com`,
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
    stableswapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    hasFactory: true,
  },
}

export const networksIdMapper = Object.keys(networks).reduce((prev, curr: unknown) => {
  const networkConfig = networks[curr as ChainId]
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
