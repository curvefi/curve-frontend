export enum MarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

/** How a market's assets move together. Missing means the market has no explicit assignment. */
export enum MarketAssetsType {
  Correlated = 'correlated', // Assets expected to maintain a close price relationship.
  BlueChip = 'blue-chip', // A pair of established assets with deep and reliable liquidity and substantial trading activity.
  LongTail = 'long-tail', // A pair involving at least one less-established asset with relatively shallow liquidity and limited trading activity.
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
