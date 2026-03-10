import type { Address } from '@primitives/address.utils'

export type SolverCompetition = {
  auctionStartBlock: number
  orders: Address[]
  prices: Record<Address, bigint>
  solutions: {
    solver: string
    solverAddress: Address
    score: bigint
    ranking: number
    clearingPrices: Record<Address, bigint>
    orders: {
      id: Address
      sellAmount: bigint
      buyAmount: bigint
    }[]
  }[]
}
