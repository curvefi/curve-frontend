import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'

export const CRVUSD_UNIT = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

export const PEG_KEEPERS = [
  {
    address: '0x9201da0d97caaaff53f01b2fb56767c7072de340',
    token: 'USDC',
    poolUrl: getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/factory-crvusd-0/deposit`),
    pool: {
      id: 'factory-crvusd-0',
      name: 'crvUSD/USDC',
      address: '0x4dece678ceceb27446b35c672dc7d61f30bad69e',
      underlyingCoins: ['USDC', 'crvUSD'],
      underlyingCoinAddresses: [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
  {
    address: '0xfb726f57d251ab5c731e5c64ed4f5f94351ef9f3',
    token: 'USDT',
    poolUrl: getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/factory-crvusd-1/deposit`),
    pool: {
      id: 'factory-crvusd-1',
      name: 'crvUSD/USDT',
      address: '0x390f3595bca2df7d23783dfd126427cceb997bf4',
      underlyingCoins: ['USDT', 'crvUSD'],
      underlyingCoinAddresses: [
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
  {
    address: '0x3fa20eaa107de08b38a8734063d605d5842fe09c',
    token: 'pyUSD',
    poolUrl: getInternalUrl('dex', 'ethereum', `${DEX_ROUTES.PAGE_POOLS}/factory-stable-ng-42/deposit`),
    pool: {
      id: 'factory-stable-ng-42',
      name: 'pyUSD/crvUSD',
      address: '0x625e92624bc2d88619accc1788365a69767f6200',
      underlyingCoins: ['PYUSD', 'crvUSD'],
      underlyingCoinAddresses: [
        '0x6c3ea9036406852006290770bedfcaba0e23a0e8',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
] as const
