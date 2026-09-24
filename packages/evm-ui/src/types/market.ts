export enum MarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

/** Describes how a market's assets move in price relative to one another. */
export enum MarketAssetsType {
  Stable = 'stable',
  Volatile = 'volatile',
}

export enum MarketVersion {
  v1 = 'v1',
  v2 = 'v2',
}

export enum MarketRateType {
  Borrow = 'Borrow',
  Supply = 'Supply',
}

export type ExtraIncentive = { title: string; percentage: number; address: string; blockchainId: string }
