import type { Address } from '@primitives/address.utils'

export enum MarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

export enum MarketVersion {
  v1 = 'v1',
  v2 = 'v2',
}

export enum MarketRateType {
  Borrow = 'Borrow',
  Supply = 'Supply',
}

export type ExtraIncentive = { title: string; percentage: number; address: Address; blockchainId: string }
