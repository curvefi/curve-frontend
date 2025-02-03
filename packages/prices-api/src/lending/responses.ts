import type { Address, Chain } from '..'

type Bar = {
  value: number
  label: string
}

export type GetLoanDistributionResponse = {
  stablecoin: Bar[]
  debt: Bar[]
  collateral: Bar[]
}

export type GetOracleResponse = {
  chain: Chain
  controller: Address
  oracle: Address
  oracle_pools: [
    {
      address: Address
      borrowed_ix: number
      borrowed_symbol: string
      borrowed_address: Address
      collateral_ix: number
      collateral_symbol: string
      collateral_address: Address
    },
  ]
  data: {
    time: number
    open: number
    close: number
    high: number
    low: number
    base_price: number
    oracle_price: number
  }[]
}
