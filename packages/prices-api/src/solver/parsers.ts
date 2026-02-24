import { fromEntries, recordEntries } from '@curvefi/primitives/objects.utils'
import type * as Models from './models'
import type * as Responses from './responses'

export const parseSolverCompetition = (x: Responses.GetSolverCompetitionResponse): Models.SolverCompetition => ({
  auctionStartBlock: x.auctionStartBlock,
  orders: x.auction.orders.map((x) => x),
  prices: fromEntries(recordEntries(x.auction.prices).map(([key, value]) => [key, BigInt(value)])),
  solutions: x.solutions.map((sol) => ({
    solver: sol.solver,
    solverAddress: sol.solverAddress,
    score: BigInt(sol.score),
    ranking: sol.ranking,
    clearingPrices: fromEntries(recordEntries(sol.clearingPrices).map(([k, v]) => [k, BigInt(v)])),
    orders: sol.orders.map((order) => ({
      id: order.id,
      sellAmount: BigInt(order.sellAmount),
      buyAmount: BigInt(order.buyAmount),
    })),
  })),
})
