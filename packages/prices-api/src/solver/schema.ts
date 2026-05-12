import { z } from 'zod/v4'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import { address } from '../schemas'

export const getSolverCompetitionResponse = z
  .object({
    auctionStartBlock: z.number(),
    auction: z.object({
      orders: z.array(address),
      prices: z.record(z.string(), z.string()),
    }),
    solutions: z.array(
      z.object({
        solver: z.string(),
        solverAddress: address,
        score: z.string(),
        ranking: z.number(),
        clearingPrices: z.record(z.string(), z.string()),
        orders: z.array(
          z.object({
            id: address,
            sellAmount: z.number(),
            buyAmount: z.number(),
          }),
        ),
      }),
    ),
  })
  .transform(data => ({
    auctionStartBlock: data.auctionStartBlock,
    orders: data.auction.orders.map(order => order),
    prices: fromEntries(recordEntries(data.auction.prices).map(([key, value]) => [key, BigInt(value)])),
    solutions: data.solutions.map(solution => ({
      solver: solution.solver,
      solverAddress: solution.solverAddress,
      score: BigInt(solution.score),
      ranking: solution.ranking,
      clearingPrices: fromEntries(recordEntries(solution.clearingPrices).map(([key, value]) => [key, BigInt(value)])),
      orders: solution.orders.map(order => ({
        id: order.id,
        sellAmount: BigInt(order.sellAmount),
        buyAmount: BigInt(order.buyAmount),
      })),
    })),
  }))

export type SolverCompetition = z.infer<typeof getSolverCompetitionResponse>
