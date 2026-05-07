export enum LlamaMarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

export enum LlamaMarketVersion {
  v1 = '1',
  v2 = '2',
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
