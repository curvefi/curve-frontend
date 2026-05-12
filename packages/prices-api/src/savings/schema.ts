import { z } from 'zod/v4'
import { address, timestampResponse } from '../schemas'
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
  .transform(data => ({
    type: data.action_type.toLowerCase(),
    sender: data.sender,
    owner: data.owner,
    receiver: data.receiver ? data.receiver : undefined,
    assets: BigInt(data.assets),
    supply: BigInt(data.shares),
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
    txHash: data.transaction_hash,
  }))

const yieldData = z
  .object({
    timestamp: timestampResponse,
    assets: z.number(),
    supply: z.number(),
    proj_apy: numberLike,
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.timestamp),
    assets: data.assets,
    supply: data.supply,
    apyProjected: data.proj_apy,
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
  .transform(data => ({
    strategy: data.strategy,
    gain: BigInt(data.gain),
    loss: BigInt(data.loss),
    currentDebt: BigInt(data.current_debt),
    totalRefunds: BigInt(data.total_refunds),
    feesTotal: BigInt(data.total_fees),
    feesProtocol: BigInt(data.protocol_fees),
    txHash: data.tx_hash,
    timestamp: parseTimestamp(data.dt),
  }))

export const getEventsResponse = z
  .object({
    count: z.number(),
    events: z.array(event),
  })
  .transform(data => ({ count: data.count, events: data.events }))

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
  .transform(data => ({ totalDistributed: data.total_distributed, history: data.history }))

export const getStatisticsResponse = z
  .object({
    last_updated: timestampResponse,
    last_updated_block: z.number(),
    proj_apy: z.number(),
    supply: z.number(),
  })
  .transform(data => ({
    lastUpdated: parseTimestamp(data.last_updated),
    lastUpdatedBlock: data.last_updated_block,
    apyProjected: data.proj_apy,
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
  .transform(data => ({
    totalDeposited: BigInt(data.total_deposited),
    totalReceived: BigInt(data.total_received ?? data.total_recieved ?? '0'),
    totalWithdrawn: BigInt(data.total_withdrawn),
    totalTransferredIn: BigInt(data.total_transferred_in),
    totalTransferredOut: BigInt(data.total_transferred_out),
    currentBalance: BigInt(data.current_balance),
  }))

export type Event = z.infer<typeof event>
export type Yield = z.infer<typeof yieldData>
export type Revenue = z.infer<typeof revenue>
export type Statistics = z.infer<typeof getStatisticsResponse>
export type UserStats = z.infer<typeof getUserStatsResponse>
