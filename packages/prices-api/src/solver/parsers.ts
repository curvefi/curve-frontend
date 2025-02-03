import type * as Responses from './responses'
import type * as Models from './models'

export const parseSolverCompetition = (x: Responses.GetSolverCompetitionResponse): Models.SolverCompetition => ({
  auctionStartBlock: x.auctionStartBlock,
  orders: x.auction.orders.map((x) => x),
  prices: Object.fromEntries(Object.entries(x.auction.prices).map(([key, value]) => [key, BigInt(value)])),
  solutions: x.solutions.map((sol) => ({
    solver: sol.solver,
    solverAddress: sol.solverAddress,
    score: BigInt(sol.score),
    ranking: sol.ranking,
    clearingPrices: Object.fromEntries(Object.entries(sol.clearingPrices).map(([k, v]) => [k, BigInt(v)])),
    orders: sol.orders.map((order) => ({
      id: order.id,
      sellAmount: BigInt(order.sellAmount),
      buyAmount: BigInt(order.buyAmount),
    })),
  })),
})
