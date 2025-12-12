import { UserWalletBalances } from '@/loan/types/loan.types'
import { CRVUSD_ROUTES } from '@ui-kit/shared/routes'

export const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as const
export const SCRVUSD_VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367' // same address as token

export const ROUTE = { ...CRVUSD_ROUTES, PAGE_INTEGRATIONS: '/integrations', PAGE_404: '/404' }

export const SCRVUSD_GAS_ESTIMATE = { FIRST_DEPOSIT: 95500, FOLLOWING_DEPOSIT: 78500, WITHDRAW: 73500 }

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
}

export const DEFAULT_WALLET_BALANCES: UserWalletBalances = { stablecoin: '0', collateral: '0', error: '' }

export enum RouteAggregator {
  Odos = 'odos',
}

export const ROUTE_AGGREGATOR_LABELS: Record<RouteAggregator, string> = {
  [RouteAggregator.Odos]: 'Odos',
}
