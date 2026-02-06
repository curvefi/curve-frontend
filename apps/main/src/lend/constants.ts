import { LEND_ROUTES } from '@ui-kit/shared/routes'

export const MARKET_ROUTES = {
  PAGE_LOAN: '',
  PAGE_VAULT: '/vault',
} as const

export type LendMarketRoute = (typeof MARKET_ROUTES)[keyof typeof MARKET_ROUTES]

export const ROUTE = {
  ...LEND_ROUTES,
  PAGE_INTEGRATIONS: '/integrations',
  ...MARKET_ROUTES,
  PAGE_404: '/404',
} as const

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
  positionCurrentLeverage = 'positionCurrentLeverage',
}
