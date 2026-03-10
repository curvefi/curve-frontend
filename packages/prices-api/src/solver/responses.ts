import type { Address } from '@primitives/address.utils'

export type GetSolverCompetitionResponse = {
  auctionStartBlock: number
  auction: {
    orders: Address[]
    prices: Record<string, string>
  }
  solutions: {
    solver: string
    solverAddress: Address
    score: string
    ranking: number
    clearingPrices: Record<string, string>
    orders: {
      id: Address
      sellAmount: number
      buyAmount: number
    }[]
  }[]
}
