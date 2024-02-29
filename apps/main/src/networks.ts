import sortBy from 'lodash/sortBy'

import { ROUTE } from '@/constants'
import curvejsApi from '@/lib/curvejs'
import {
  RCArbitrumLogo,
  RCAvalancheLogo,
  RCAuroraLogo,
  RCCeloLogo,
  RCEthereumLogo,
  RCFantomLogo,
  RCKavaLogo,
  RCMoonbeamLogo,
  RCOptimismLogo,
  RCPolygonLogo,
  RCGnosisLogo,
  RCZksyncLogo,
  RCBaseLogo,
  RCBSCLogo,
} from '@/ui/images'

const CURVE_IMAGE_ASSETS_BASE_PATH = 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets'

const isDevelopment = process.env.NODE_ENV === 'development'

const NETWORK_CONFIG_DEFAULT = {
  api: curvejsApi,
  blocknativeSupport: true,
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
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: 'https://api.curve.fi/api/getGas',
  gasPricesDefault: 0,
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
  basePools: [],
  stableSwapFactory: false,
  cryptoSwapFactory: false,
  twocryptoFactory: false,
  tricryptoFactory: false,
  stableSwapNg: false,
  hasFactory: false,
  pricesApi: false,
  integrations: {
    imageBaseurl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/platforms',
    listUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-integrations/integrations-list.json',
    tagsUrl: 'https://cdn.jsdelivr.net/gh/curvefi/curve-external-integrations/integrations-tags.json',
  },
}

const networks: Record<ChainId, NetworkConfig> = {
  1: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Ethereum',
    id: 'ethereum',
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
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'crvusd', 'tricrypto', 'others', 'stableng', 'user'],
    gasPricesDefault: 1,
    hex: '0x1',
    hidePoolRewards: {
      crveth: true,
      'factory-v2-38': true,
      'factory-v2-252': true,
      'factory-v2-194': true,
      'factory-v2-56': true, // Ankr Reward-Earning Staked ETH
    },
    icon: RCEthereumLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets/`,
    missingPools: [
      { name: 'linkusd', url: 'https://classic.curve.fi/linkusd/withdraw' },
      { name: 'tricrypto', url: 'https://classic.curve.fi/tricrypto/withdraw' },
    ],
    networkId: 1,
    orgUIPath: 'https://classic.curve.fi',
    rpcUrlConnectWallet: `https://eth.drpc.org`,
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_ETHEREUM_DEV_RPC_URL!
      : `https://curve.drpc.org/ogrpc?network=ethereum`,
    swap: {
      fromAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      toAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    customPoolIds: {
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
    symbol: 'ETH',
    createQuickList: [
      {
        address: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
        haveSameTokenName: false,
        symbol: '3Crv',
      },
      {
        address: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
        haveSameTokenName: false,
        symbol: 'FRAXBP',
      },
      {
        address: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
        haveSameTokenName: false,
        symbol: 'crvUSD',
      },
    ],
    basePools: [
      {
        name: '3pool',
        token: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
        pool: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
        coins: [
          '0x6b175474e89094c44da98b954eedeac495271d0f', // dai
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
          '0xdac17f958d2ee523a2206206994597c13d831ec7', // usdt
        ],
      },
      {
        name: 'fraxBp',
        token: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
        pool: '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
        coins: [
          '0x853d955acef822db058eb8505911ed77f175b99e', // frax
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
        ],
      },
      {
        name: 'sbtc2Crv',
        pool: '0xae34574ac03a15cd58a92dc79de7b1a0800f1ce3',
        token: '0xfc2838a17d8e8b1d5456e0a351b0708a09211147',
        coins: [
          '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6', // sbtc
          '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // wbtc
        ],
      },
      // {
      //   name: 'paypool',
      //   pool: '0x383e6b4437b59fff47b619cba855ca29342a8559',
      //   token: '0x383e6b4437b59fff47b619cba855ca29342a8559',
      //   coins: [
      //     '0x6c3ea9036406852006290770bedfcaba0e23a0e8', // pyusd
      //     '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
      //   ],
      // },
      // {
      //   name: 'fraxpyusd',
      //   pool: '0xa5588f7cdf560811710a2d82d3c9c99769db1dcb',
      //   token: '0xa5588f7cdf560811710a2d82d3c9c99769db1dcb',
      //   coins: [
      //     '0x853d955acef822db058eb8505911ed77f175b99e', // frax
      //     '0x6c3ea9036406852006290770bedfcaba0e23a0e8', // pyusd
      //   ],
      // },
      // {
      //   name: '3payllama',
      //   pool: '0x2e1d500091ef244fdcb6b83c86143e28388e473a',
      //   token: '0x2e1d500091ef244fdcb6b83c86143e28388e473a',
      //   coins: [
      //     '0x6c3ea9036406852006290770bedfcaba0e23a0e8', // pyusd
      //     '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e', // crvUSD
      //     '0x853d955acef822db058eb8505911ed77f175b99e', // frax
      //   ],
      // },
      {
        name: 'fraxusdp',
        pool: '0xf253f83aca21aabd2a20553ae0bf7f65c755a07f',
        token: '0x051d7e5609917bd9b73f04bac0ded8dd46a74301',
        coins: [
          '0x853d955acef822db058eb8505911ed77f175b99e', // frax
          '0x8e870d67f660d95d5be530380d0ec0bd388289e1', // usdp
        ],
      },
    ],
    stableSwapFactory: true,
    cryptoSwapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    pricesApi: true,
    scanAddressPath: (hash: string) => `https://etherscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://etherscan.com/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://etherscan.io/token/${hash}`,
  },
  10: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Optimism',
    id: 'optimism',
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasL2: true,
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0xa',
    icon: RCOptimismLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-optimism/`,
    networkId: 10,
    orgUIPath: 'https://optimism.curve.fi',
    rpcUrlConnectWallet: 'https://optimism.drpc.org',
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
        address: '0x1337bedc9d22ecbe766df105c9623922a27963ec',
        haveSameTokenName: false,
        symbol: '3Crv',
      },
      {
        address: '0x29a3d66b30bc4ad674a4fdaf27578b64f6afbfe7',
        haveSameTokenName: false,
        symbol: 'FRAXBP',
      },
    ],
    basePools: [
      {
        name: '3pool',
        token: '0x1337bedc9d22ecbe766df105c9623922a27963ec',
        pool: '0x1337bedc9d22ecbe766df105c9623922a27963ec',
        coins: [
          '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
          '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
          '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        ],
      },
      {
        name: 'fraxBp',
        token: '0x29a3d66b30bc4ad674a4fdaf27578b64f6afbfe7',
        pool: '0x29a3d66b30bc4ad674a4fdaf27578b64f6afbfe7',
        coins: ['0x2e3d870790dc77a83dd1d18184acc7439a53f475', '0x7f5c764cbc14f9669b88837ca1490cca17c31607'],
      },
    ],
    stableSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    pricesApi: true,
    scanAddressPath: (hash: string) => `https://optimistic.etherscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://optimistic.etherscan.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://optimistic.etherscan.io/token/${hash}`,
  },
  100: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Gnosis',
    id: 'xdai',
    poolFilters: ['all', 'usd', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0x64',
    icon: RCGnosisLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-xdai/`,
    networkId: 100,
    orgUIPath: 'https://xdai.curve.fi',
    rpcUrlConnectWallet: 'https://rpc.gnosischain.com',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_GNOSIS_DEV_RPC_URL! : 'https://rpc.gnosischain.com',
    swap: {
      fromAddress: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
      toAddress: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
    },
    symbol: 'XDAI',
    createQuickList: [
      {
        address: '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
        haveSameTokenName: false,
        symbol: 'x3CRV',
      },
    ],
    basePools: [
      {
        name: '3pool',
        token: '0x1337bedc9d22ecbe766df105c9623922a27963ec',
        pool: '0x7f90122bf0700f9e7e1f688fe926940e8839f353',
        coins: [
          '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
          '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
          '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
        ],
      },
    ],
    stableSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    scanAddressPath: (hash: string) => `https://gnosisscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://gnosisscan.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://gnosisscan.io/address/${hash}`,
  },
  1284: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Moonbeam',
    id: 'moonbeam',
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0x504',
    icon: RCMoonbeamLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-moonbeam/`,
    networkId: 1284,
    orgUIPath: 'https://moonbeam.curve.fi',
    rpcUrlConnectWallet: 'https://moonbeam.public.blastapi.io',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_MOONBEAM_DEV_RPC_URL! : 'https://moonbeam.public.blastapi.io',
    swap: {
      fromAddress: '0xffffffff1fcacbd218edc0eba20fc2308c778080',
      toAddress: '0xfa36fe1da08c89ec72ea1f0143a35bfd5daea108',
    },
    symbol: 'GLMR',
    createQuickList: [],
    basePools: [],
    stableSwapFactory: true,
    hasFactory: true,
    scanAddressPath: (hash: string) => `https://moonscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://moonscan.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://moonscan.io/address/${hash}`,
  },
  137: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Polygon',
    id: 'polygon',
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
    hex: '0x89',
    icon: RCPolygonLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-polygon/`,
    missingPools: [
      { name: 'atricrypto', url: 'https://polygon.curve.fi/atricrypto/withdraw' },
      { name: 'atricrypto2', url: 'https://polygon.curve.fi/atricrypto2/withdraw' },
    ],
    networkId: 137,
    orgUIPath: 'https://polygon.curve.fi',
    rpcUrlConnectWallet: 'https://polygon-rpc.com',
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_POLYGON_DEV_RPC_URL!
      : 'https://curve.drpc.org/ogrpc?network=polygon',
    swap: {
      fromAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
      toAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    },
    symbol: 'MATIC',
    basePools: [],
    stableSwapFactory: true,
    cryptoSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    pricesApi: true,
    scanAddressPath: (hash: string) => `https://polygonscan.com/address/${hash}`,
    scanTxPath: (hash: string) => `https://polygonscan.com/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://polygonscan.com/token/${hash}`,
  },
  2222: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Kava',
    id: 'kava',
    poolFilters: ['all', 'usd', 'btc', 'kava', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUnit: 'UKAVA',
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0x8ae',
    icon: RCKavaLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-kava/`,
    networkId: 2222,
    orgUIPath: 'https://kava.curve.fi',
    poolListFormValuesDefault: { hideSmallPools: false }, // remove if Kava have > 10 pools
    rpcUrlConnectWallet: 'https://evm.kava.io',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_KAVA_DEV_RPC_URL! : 'https://evm.kava.io',
    swap: {
      fromAddress: '0x765277eebeca2e31912c9946eae1021199b39c61',
      toAddress: '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    },
    symbol: 'KAVA',
    createQuickList: [],
    basePools: [],
    stableSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    scanAddressPath: (hash: string) => `https://explorer.kava.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://explorer.kava.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://explorer.kava.io/address/${hash}`,
  },
  250: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Fantom',
    id: 'fantom',
    customPoolIds: {
      'factory-v2-137': true, // old eywa pool
      'factory-v2-140': true, // old eywa pool
    },
    excludeGetUserBalancesTokens: ['0x618b22e6fddd6870cdfb4146ef2d4bc62efc660a'],
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0xfa',
    icon: RCFantomLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-fantom/`,
    networkId: 250,
    orgUIPath: 'https://ftm.curve.fi',
    rpcUrlConnectWallet: 'https://rpc.ftm.tools/',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_FANTOM_DEV_RPC_URL! : 'https://rpc.ftm.tools/',
    swap: {
      fromAddress: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
      toAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    },
    symbol: 'FTM',
    createQuickList: [],
    basePools: [],
    stableSwapFactory: true,
    cryptoSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    pricesApi: true,
    scanAddressPath: (hash: string) => `https://ftmscan.com/address/${hash}`,
    scanTxPath: (hash: string) => `https://ftmscan.com/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://ftmscan.com/token/${hash}`,
  },
  42161: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Arbitrum',
    id: 'arbitrum',
    excludeGetUserBalancesTokens: ['0x3aef260cb6a5b469f970fae7a1e233dbd5939378'],
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0xa4b1',
    hidePoolRewards: { tricrypto: true },
    icon: RCArbitrumLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-arbitrum/`,
    networkId: 42161,
    orgUIPath: 'https://arbitrum.curve.fi',
    rpcUrlConnectWallet: 'https://arb1.arbitrum.io/rpc',
    rpcUrl: isDevelopment
      ? process.env.NEXT_PUBLIC_ARBITRUM_DEV_RPC_URL!
      : 'https://curve.drpc.org/ogrpc?network=arbitrum',
    swap: {
      fromAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      toAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    },
    symbol: 'ETH',
    createQuickList: [
      {
        address: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
        haveSameTokenName: false,
        symbol: 'FRAXBP',
      },
      {
        address: '0x7f90122bf0700f9e7e1f688fe926940e8839f353',
        haveSameTokenName: false,
        symbol: '2CRV',
      },
    ],
    basePools: [
      {
        name: '2pool',
        pool: '0x7f90122bf0700f9e7e1f688fe926940e8839f353',
        token: '0x7f90122bf0700f9e7e1f688fe926940e8839f353',
        coins: ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'],
      },
      {
        name: 'fraxbp',
        pool: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
        token: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
        coins: ['0x17fc002b466eec40dae837fc4be5c67993ddbd6f', '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
      },
    ],
    stableSwapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    pricesApi: true,
    scanAddressPath: (hash: string) => `https://arbiscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://arbiscan.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://arbiscan.io/token/${hash}`,
  },
  43114: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Avalanche',
    id: 'avalanche',
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
    hex: '0xa86a',
    icon: RCAvalancheLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-avalanche/`,
    networkId: 43114,
    orgUIPath: 'https://avax.curve.fi',
    rpcUrlConnectWallet: 'https://api.avax.network/ext/bc/C/rpc',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_AVALANCHE_DEV_RPC_URL! : 'https://api.avax.network/ext/bc/C/rpc',
    swap: {
      fromAddress: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
      toAddress: '0xc7198437980c041c805a1edcba50c1ce5db95118',
    },
    symbol: 'AVAX',
    basePools: [],
    stableSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    scanAddressPath: (hash: string) => `https://snowtrace.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://snowtrace.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://snowtrace.io/token/${hash}`,
  },
  42220: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Celo',
    id: 'celo',
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER, ROUTE.PAGE_CREATE_POOL],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0xa4ec',
    icon: RCCeloLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-celo/`,
    networkId: 42220,
    orgUIPath: 'https://celo.curve.fi',
    rpcUrlConnectWallet: 'https://forno.celo.org',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_CELO_DEV_RPC_URL! : 'https://forno.celo.org',
    swap: {
      fromAddress: '0x37f750b7cc259a2f741af45294f6a16572cf5cad',
      toAddress: '0x617f3112bf5397d0467d315cc709ef968d9ba546',
    },
    symbol: 'CELO',
    stableSwapNg: true,
    twocryptoFactory: true,
    scanAddressPath: (hash: string) => `https://celoscan.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://celoscan.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://celoscan.io/address/${hash}`,
  },
  1313161554: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Aurora',
    id: 'aurora',
    poolFilters: ['all', 'usd', 'btc', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER, ROUTE.PAGE_CREATE_POOL],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0x4e454152',
    icon: RCAuroraLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-aurora/`,
    networkId: 1313161554,
    orgUIPath: 'https://aurora.curve.fi',
    rpcUrlConnectWallet: 'https://mainnet.aurora.dev',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_AURORA_DEV_RPC_URL! : 'https://mainnet.aurora.dev',
    swap: {
      fromAddress: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      toAddress: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
    },
    symbol: 'aETH',
    stableSwapNg: true,
    twocryptoFactory: true,
    scanAddressPath: (hash: string) => `https://aurorascan.dev/address/${hash}`,
    scanTxPath: (hash: string) => `https://aurorascan.dev/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://aurorascan.dev/address/${hash}`,
  },
  324: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'zkSync Era',
    id: 'zksync',
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER'
    }),
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0x144',
    icon: RCZksyncLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-zksync/`,
    networkId: 324,
    orgUIPath: '',
    rpcUrlConnectWallet: 'https://mainnet.era.zksync.io',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_ZKSYNC_DEV_RPC_URL! : 'https://mainnet.era.zksync.io',
    showInSelectNetwork: false,
    symbol: 'ETH',
    stableSwapNg: true,
    scanAddressPath: (hash: string) => `https://explorer.zksync.io/address/${hash}`,
    scanTxPath: (hash: string) => `https://explorer.zksync.io/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://explorer.zksync.io/token/${hash}`,
  },
  8453: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'Base',
    id: 'base',
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER' && f !== 'SWAP_REQUIRED'
    }),
    gasL2: true,
    gasPricesUrl: '',
    gasPricesDefault: 0,
    hex: '0x2105',
    customPoolIds: { 'factory-v2-4': true, 'factory-v2-5': true },
    hideSmallPoolsTvl: 5000,
    icon: RCBaseLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-base/`,
    networkId: 8453,
    orgUIPath: '',
    rpcUrlConnectWallet: 'https://base.drpc.org',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BASE_DEV_RPC_URL! : 'https://curve.drpc.org/ogrpc?network=base',
    showHideSmallPoolsCheckbox: true,
    symbol: 'ETH',
    swap: {
      fromAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      toAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    },
    stableSwapFactory: true,
    cryptoSwapFactory: true,
    twocryptoFactory: true,
    tricryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    pricesApi: true,
    scanAddressPath: (hash: string) => `https://basescan.org/address/${hash}`,
    scanTxPath: (hash: string) => `https://basescan.org/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://basescan.org/token/${hash}`,
  },
  56: {
    ...NETWORK_CONFIG_DEFAULT,
    name: 'BSC',
    id: 'bsc',
    poolFilters: ['all', 'usd', 'btc', 'eth', 'crypto', 'stableng', 'others', 'user'],
    excludeRoutes: [ROUTE.PAGE_LOCKER],
    forms: NETWORK_CONFIG_DEFAULT.forms.filter((f) => {
      return f !== 'BOOSTING' && f !== 'LOCKER' && f !== 'SWAP_REQUIRED'
    }),
    hex: '0x38',
    icon: RCBSCLogo,
    imageBaseUrl: `${CURVE_IMAGE_ASSETS_BASE_PATH}/images/assets-bsc/`,
    networkId: 56,
    orgUIPath: '',
    rpcUrlConnectWallet: 'https://bsc-dataseed1.binance.org/',
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_BSC_DEV_RPC_URL! : 'https://curve.drpc.org/ogrpc?network=bsc',
    symbol: 'BNB',
    swap: {
      fromAddress: '0xe9c803f48dffe50180bd5b01dc04da939e3445fc',
      toAddress: '0xcba2aeec821b0b119857a9ab39e09b034249681a',
    },
    stableSwapFactory: true,
    cryptoSwapFactory: true,
    twocryptoFactory: true,
    stableSwapNg: true,
    hasFactory: true,
    scanAddressPath: (hash: string) => `https://bscscan.com/address/${hash}`,
    scanTxPath: (hash: string) => `https://bscscan.com/tx/${hash}`,
    scanTokenPath: (hash: string) => `https://bscscan.com/token/${hash}`,
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
