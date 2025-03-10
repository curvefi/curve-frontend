import { APP_LINK, CRVUSD_ROUTES } from '@ui-kit/shared/routes'

export const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'
export const SCRVUSD_VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367' // same address as token
export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ETHEREUM_CHAIN_ID = 1

export const ROUTE = {
  ...CRVUSD_ROUTES,
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_DISCLAIMER: '/disclaimer',
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_404: '/404',
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const

export const SCRVUSD_GAS_ESTIMATE = {
  FIRST_DEPOSIT: 95500,
  FOLLOWING_DEPOSIT: 78500,
  WITHDRAW: 73500,
}

export enum TITLE {
  isInMarket = 'isInMarket',
  name = 'name',
  tokenCollateral = 'tokenCollateral',
  tokenBorrow = 'tokenBorrow',
  rate = 'rate',
  available = 'available',
  totalBorrowed = 'totalBorrowed',
  cap = 'cap',
  totalCollateral = 'totalCollateral',
  myDebt = 'myDebt',
  myHealth = 'myHealth',
  healthStatus = 'healthStatus',
  healthPercent = 'healthPercent',
  liquidationRange = 'liquidationRange',
  liquidationBandRange = 'liquidationBandRange',
  liquidationRangePercent = 'liquidationRangePercent',
  lossCollateral = 'lossCollateral',
  lossAmount = 'lossAmount',
  lossPercent = 'lossPercent',
  llammaBalances = 'llammaBalances',
}

const BASE_URL = APP_LINK.dex.root

export const PEG_KEEPERS = {
  '0x9201da0d97caaaff53f01b2fb56767c7072de340': {
    address: '0x9201da0d97caaaff53f01b2fb56767c7072de340',
    token: 'USDC',
    poolUrl: `${BASE_URL}/ethereum/pools/factory-crvusd-0/deposit`,
    pool: {
      id: 'factory-crvusd-0',
      name: 'crvUSD/USDC',
      underlyingCoins: ['USDC', 'crvUSD'],
      underlyingCoinAddresses: [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
  '0xfb726f57d251ab5c731e5c64ed4f5f94351ef9f3': {
    address: '0xfb726f57d251ab5c731e5c64ed4f5f94351ef9f3',
    token: 'USDT',
    poolUrl: `${BASE_URL}/ethereum/pools/factory-crvusd-1/deposit`,
    pool: {
      id: 'factory-crvusd-1',
      name: 'crvUSD/USDT',
      underlyingCoins: ['USDT', 'crvUSD'],
      underlyingCoinAddresses: [
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
  '0x3fa20eaa107de08b38a8734063d605d5842fe09c': {
    address: '0x3fa20eaa107de08b38a8734063d605d5842fe09c',
    token: 'pyUSD',
    poolUrl: `${BASE_URL}/ethereum/pools/factory-stable-ng-42/deposit`,
    pool: {
      id: 'factory-stable-ng-42',
      name: 'pyUSD/crvUSD',
      underlyingCoins: ['PYUSD', 'crvUSD'],
      underlyingCoinAddresses: [
        '0x6c3ea9036406852006290770bedfcaba0e23a0e8',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
  '0x503e1bf274e7a6c64152395ae8eb57ec391f91f8': {
    address: '0x503e1bf274e7a6c64152395ae8eb57ec391f91f8',
    token: 'USDM',
    poolUrl: `${BASE_URL}/ethereum/pools/factory-stable-ng-154/deposit`,
    pool: {
      id: 'factory-stable-ng-154',
      name: 'crvUSD/USDM',
      underlyingCoins: ['USDM', 'crvUSD'],
      underlyingCoinAddresses: [
        '0x59d9356e565ab3a36dd77763fc0d87feaf85508c',
        '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
      ],
    },
  },
}

export const PEG_KEEPERS_ADDRESSES = Object.keys(PEG_KEEPERS)
