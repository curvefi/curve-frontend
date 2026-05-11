export enum LlamaMarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

export enum LlamaMarketVersion {
  v1 = 'v1',
  v2 = 'v2',
}

export enum MarketRateType {
  Borrow = 'Borrow',
  Supply = 'Supply',
}

export type ExtraIncentive = {
  title: string
  percentage: number
  address: string
  blockchainId: string
}
