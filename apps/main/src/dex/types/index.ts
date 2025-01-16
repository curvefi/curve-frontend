export type Order = 'desc' | 'asc'

export type UserBaseProfit = {
  day: string
  week: string
  month: string
  year: string
}

export type UserClaimableToken = {
  token: string
  symbol: string
  amount: string
  price: number
}

export interface UserTokenProfit extends UserBaseProfit {
  token: string
  symbol: string
  price: number
}
