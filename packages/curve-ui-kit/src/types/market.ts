// todo: use string enums to improve the type safety
export type MarketType = 'mint' | 'lend'
export type MarketRateType = 'borrow' | 'supply'

export type ExtraIncentive = {
  title: string
  percentage: number
  address: string
  blockchainId: string
}
