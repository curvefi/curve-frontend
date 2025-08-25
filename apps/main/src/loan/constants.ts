import { CRVUSD_ROUTES } from '@ui-kit/shared/routes'

export const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'
export const SCRVUSD_VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367' // same address as token
export const ETHEREUM_CHAIN_ID = 1

export const ROUTE = {
  ...CRVUSD_ROUTES,
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_DISCLAIMER: '/disclaimer',
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_404: '/404',
}

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
  leverage = 'leverage',
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
