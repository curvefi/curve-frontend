import type { Address } from '@primitives/address.utils'

export type GetCushionsResponse = {
  data: {
    pool: Address
    name: string
    admin_fees: number[]
    usd_value: number
  }[]
}

export type GetByChainResponse = {
  revenue: {
    chain: string
    totalDailyFeesUSD: number
  }[]
}

export type GetTopPoolsResponse = {
  revenue: {
    name: string
    totalDailyFeesUSD: number
  }[]
}

export type GetCrvUsdWeeklyResponse = {
  fees: {
    controller: Address
    collateral: string
    fees_usd: number
    timestamp: string
  }[]
}

export type GetPoolsWeeklyResponse = {
  fees: {
    chain: string
    fees_usd: number
    timestamp: string
  }[]
}

export type GetDistributionsResponse = {
  distributions: {
    timestamp: string
    fees_usd: number
  }[]
}

export type GetCowSwapSettlementsResponse = {
  data: {
    coin: {
      lp_token: boolean
      symbol: string
      address: Address
      precision: number
    }
    amount: string
    fee_amount: string
    amount_received: number
    router_received: number
    epoch: number
    tx_hash: Address
    block_number: number
    dt: string
  }[]
}

type GetFeesResponse = {
  coin: {
    lp_token: boolean
    symbol: string
    address: Address
    precision: number
  }
  amount: string
  usd_amount: string
}

export type GetFeesCollectedResponse = {
  data: GetFeesResponse[]
}

export type GetFeesStagedResponse = {
  data: GetFeesResponse[]
}
