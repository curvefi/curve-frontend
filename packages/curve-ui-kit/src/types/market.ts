export enum LlamaMarketType {
  Mint = 'Mint',
  Lend = 'Lend',
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
