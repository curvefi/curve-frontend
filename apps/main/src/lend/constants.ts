import { LEND_ROUTES } from '@ui-kit/shared/routes'
export { CONNECT_STAGE } from '@ui/utils/utilsConnectState'

export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'
export const NETWORK_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const ROUTE = {
  ...LEND_ROUTES,
  PAGE_INTEGRATIONS: '/integrations',
  PAGE_DISCLAIMER: '/disclaimer',
  PAGE_CREATE: '/create',
  PAGE_MANAGE: '/manage',
  PAGE_VAULT: '/vault',
  PAGE_404: '/404',
}

export const REFRESH_INTERVAL = {
  '3s': 3000,
  '4s': 4000,
  '10s': 10000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}

// TODO: translation
export const NOFITY_MESSAGE = {
  pendingConfirm: 'Pending wallet confirmation.',
}

export enum TITLE {
  isInMarket = 'isInMarket',
  name = 'name',
  available = 'available',
  cap = 'cap',
  utilization = 'utilization',
  rateBorrow = 'rateBorrow',
  rateLend = 'rateLend',
  myDebt = 'myDebt',
  myHealth = 'myHealth',
  myVaultShares = 'myVaultShares',
  tokenCollateral = 'tokenCollateral',
  tokenBorrow = 'tokenBorrow',
  tokenSupply = 'tokenSupply',
  totalCollateralValue = 'totalCollateralValue',
  totalDebt = 'totalDebt',
  totalLiquidity = 'totalLiquidity',
  leverage = 'leverage',
  totalApr = 'totalApr',
  points = 'points',
  vaultShares = 'vaultShares',
  healthStatus = 'healthStatus',
  healthPercent = 'healthPercent',
  liquidationRange = 'liquidationRange',
  liquidationBandRange = 'liquidationBandRange',
  liquidationRangePercent = 'liquidationRangePercent',
  lossCollateral = 'lossCollateral',
  lossAmount = 'lossAmount',
  lossPercent = 'lossPercent',
  llammaBalances = 'llammaBalances',
  profitAndLoss = 'profitAndLoss',
  positionCurrentLeverage = 'positionCurrentLeverage',
}
