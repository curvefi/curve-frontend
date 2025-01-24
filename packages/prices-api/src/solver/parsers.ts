import type { Address } from '..'
import type * as Responses from './responses'
import type * as Models from './models'

export const parseSolverCompetition = (x: Responses.GetSolverCompetitionResponse): Models.SolverCompetition => ({
  auctionStartBlock: x.auctionStartBlock,
  orders: x.auction.orders.map((x) => x),
  prices: Object.entries(x.auction.prices).reduce<Record<Address, bigint>>((acc, [key, value]) => {
    acc[key as Address] = BigInt(value)
    return acc
  }, {}),
  solutions: x.solutions.map((sol) => ({
    solver: sol.solver,
    solverAddress: sol.solverAddress,
    score: BigInt(sol.score),
    ranking: sol.ranking,
    clearingPrices: Object.entries(sol.clearingPrices).reduce<Record<Address, bigint>>((acc, [key, value]) => {
      acc[key as Address] = BigInt(value)
      return acc
    }, {}),
    orders: sol.orders.map((order) => ({
      id: order.id,
      sellAmount: BigInt(order.sellAmount),
      buyAmount: BigInt(order.buyAmount),
    })),
  })),
})
