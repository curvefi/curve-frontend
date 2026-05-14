import { z } from 'zod/v4'
import { chains, type Chain } from '..'
import { address, camelizeKeys, chain, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const activityType = z.enum(['crvusd', 'lending', 'pools', 'router', 'dao'])

export type ActivityType = z.infer<typeof activityType>

const activity = z.object({
  timestamp: timestampResponse,
  chain,
  type: activityType,
})

const transactions = activity
  .extend({
    transactions: z.number(),
  })
  .transform(({ timestamp, ...item }) => ({ ...item, timestamp: parseTimestamp(timestamp) }))

const users = activity
  .extend({
    users: z.number(),
  })
  .transform(({ timestamp, ...item }) => ({ ...item, timestamp: parseTimestamp(timestamp) }))

export const getSupportedChainsResponse = z
  .object({
    data: z.array(z.object({ name: z.string() })),
  })
  .transform(data => data.data.map(item => item.name as Chain).filter(item => chains.includes(item)))

export const getChainInfoResponse = z
  .object({
    chain: z.string(),
    total: z.object({
      total_tvl: z.number(),
      trading_volume_24h: z.number(),
      trading_fee_24h: z.number(),
      liquidity_volume_24h: z.number(),
      liquidity_fee_24h: z.number(),
    }),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    chain: data.chain,
    total: {
      tvl: data.total.totalTvl,
      tradingVolume24h: data.total.tradingVolume24h,
      tradingFee24h: data.total.tradingFee24h,
      liquidityVolume24h: data.total.liquidityVolume24h,
      liquidityFee24h: data.total.liquidityFee24h,
    },
  }))

export const getTransactionsResponse = z
  .object({
    data: z.array(
      z.object({
        chain,
        transactions: z.array(
          z.object({
            type: activityType,
            transactions: z.number(),
            timestamp: timestampResponse,
          }),
        ),
      }),
    ),
  })
  .transform(data =>
    data.data.flatMap(item => item.transactions.map(tx => transactions.parse({ ...tx, chain: item.chain }))),
  )

export const getUsersResponse = z
  .object({
    data: z.array(
      z.object({
        chain,
        users: z.array(
          z.object({
            type: activityType,
            users: z.number(),
            timestamp: timestampResponse,
          }),
        ),
      }),
    ),
  })
  .transform(data => data.data.flatMap(item => item.users.map(user => users.parse({ ...user, chain: item.chain }))))

export const getPoolFiltersResponse = z
  .object({
    data: z.array(
      z.object({
        chain,
        pools: z.array(
          z.object({
            name: z.string(),
            address,
          }),
        ),
      }),
    ),
  })
  .transform(data => data.data.flatMap(item => item.pools.map(pool => ({ chain: item.chain, address: pool.address }))))

export type ChainInfo = z.infer<typeof getChainInfoResponse>
export type Activity = z.infer<typeof activity>
export type Transactions = z.infer<typeof transactions>
export type Users = z.infer<typeof users>
export type PoolFilter = z.infer<typeof getPoolFiltersResponse>[number]
