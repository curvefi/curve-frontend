import { t } from '@lingui/macro'

export const INVALID_ADDRESS = '0x0000000000000000000000000000000000000000'
export const LARGE_APY = 5000000

export const MAIN_ROUTE = {
  PAGE_MARKETS: '/markets',
  PAGE_RISK_DISCLAIMER: '/risk-disclaimer',
  PAGE_INTEGRATIONS: '/integrations',
}

export const ROUTE = {
  ...MAIN_ROUTE,
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

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
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
}

export const TITLE_MAPPER: Record<TITLE, { name: string }> = {
  isInMarket: { name: '' },
  name: { name: t`Markets` },
  available: { name: t`Available` },
  cap: { name: t`Supplied` },
  utilization: { name: t`Utilization` },
  rateBorrow: { name: t`Borrow APY` },
  rateLend: { name: t`Lend APR` },
  myDebt: { name: t`My debt` },
  myHealth: { name: t`My health` },
  myVaultShares: { name: t`Earning deposits` },
  tokenCollateral: { name: t`Collateral` },
  tokenBorrow: { name: t`Borrow` },
  tokenSupply: { name: t`Lend` },
  totalCollateralValue: { name: t`Collateral value` },
  totalDebt: { name: t`Borrowed` },
  totalLiquidity: { name: t`TVL` },
  totalApr: { name: t`Total APR` },
  points: { name: t`Points` },
  leverage: { name: t`Leverage` },
  vaultShares: { name: t`Vault shares` },
}
