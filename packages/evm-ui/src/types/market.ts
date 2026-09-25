export enum MarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

/** How a market's assets move together. Missing means the market has no explicit assignment. */
export enum MarketAssetsType {
  Correlated = 'correlated',
  BlueChip = 'blue-chip',
  LongTail = 'long-tail',
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
