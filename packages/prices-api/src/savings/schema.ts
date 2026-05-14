import { z } from 'zod/v4'
import { address, camelizeKeys, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const numberLike = z.union([z.number(), z.string()]).transform(value => Number(value))

const event = z
  .object({
    action_type: z.string(),
    sender: address,
    owner: address,
    receiver: address.optional(),
    assets: z.string(),
    shares: z.string(),
    block_number: z.number(),
    timestamp: timestampResponse,
    transaction_hash: address,
  })
  .transform(camelizeKeys)
  .transform(data => ({
    type: data.actionType.toLowerCase(),
    sender: data.sender,
    owner: data.owner,
    receiver: data.receiver ? data.receiver : undefined,
    assets: BigInt(data.assets),
    supply: BigInt(data.shares),
    blockNumber: data.blockNumber,
    timestamp: parseTimestamp(data.timestamp),
    txHash: data.transactionHash,
  }))

const yieldData = z
  .object({
    timestamp: timestampResponse,
    assets: z.number(),
    supply: z.number(),
    proj_apy: numberLike,
  })
  .transform(camelizeKeys)
  .transform(({ timestamp, projApy, ...yieldData }) => ({
    ...yieldData,
    timestamp: parseTimestamp(timestamp),
    apyProjected: projApy,
  }))

const revenue = z
  .object({
    strategy: address,
    gain: z.string(),
    loss: z.string(),
    current_debt: z.string(),
    total_refunds: z.string(),
    total_fees: z.string(),
    protocol_fees: z.string(),
    tx_hash: address,
    dt: timestampResponse,
  })
  .transform(camelizeKeys)
  .transform(data => ({
    strategy: data.strategy,
    gain: BigInt(data.gain),
    loss: BigInt(data.loss),
    currentDebt: BigInt(data.currentDebt),
    totalRefunds: BigInt(data.totalRefunds),
    feesTotal: BigInt(data.totalFees),
    feesProtocol: BigInt(data.protocolFees),
    txHash: data.txHash,
    timestamp: parseTimestamp(data.dt),
  }))

export const getEventsResponse = z.object({
  count: z.number(),
  events: z.array(event),
})

export const getYieldResponse = z
  .object({
    data: z.array(yieldData),
  })
  .transform(data => data.data)

export const getRevenueResponse = z
  .object({
    count: z.number(),
    total_distributed: z.string(),
    history: z.array(revenue),
  })
  .transform(camelizeKeys)
  .transform(({ count: _count, ...revenue }) => revenue)

export const getStatisticsResponse = z
  .object({
    last_updated: timestampResponse,
    last_updated_block: z.number(),
    proj_apy: z.number(),
    supply: z.number(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    lastUpdated: parseTimestamp(data.lastUpdated),
    lastUpdatedBlock: data.lastUpdatedBlock,
    apyProjected: data.projApy,
    supply: data.supply,
  }))

export const getUserStatsResponse = z
  .object({
    total_deposited: z.string(),
    total_recieved: z.string().optional(),
    total_received: z.string().optional(),
    total_withdrawn: z.string(),
    total_transferred_in: z.string(),
    total_transferred_out: z.string(),
    current_balance: z.string(),
  })
  .transform(camelizeKeys)
  .transform(data => ({
    totalDeposited: BigInt(data.totalDeposited),
    totalReceived: BigInt(data.totalReceived ?? data.totalRecieved ?? '0'),
    totalWithdrawn: BigInt(data.totalWithdrawn),
    totalTransferredIn: BigInt(data.totalTransferredIn),
    totalTransferredOut: BigInt(data.totalTransferredOut),
    currentBalance: BigInt(data.currentBalance),
  }))

export type Event = z.infer<typeof event>
export type Yield = z.infer<typeof yieldData>
export type Revenue = z.infer<typeof revenue>
export type Statistics = z.infer<typeof getStatisticsResponse>
export type UserStats = z.infer<typeof getUserStatsResponse>
