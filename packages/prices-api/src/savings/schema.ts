import { z } from 'zod/v4'
import { address, camelizeKeys, timestamp } from '../schemas'

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
    timestamp,
    transaction_hash: address,
  })
  .transform(camelizeKeys)
  .transform(({ actionType, receiver, assets, shares, transactionHash, ...data }) => ({
    ...data,
    type: actionType.toLowerCase(),
    receiver: receiver || undefined,
    assets: BigInt(assets),
    supply: BigInt(shares),
    txHash: transactionHash,
  }))

const yieldData = z
  .object({
    timestamp,
    assets: z.number(),
    supply: z.number(),
    proj_apy: numberLike,
  })
  .transform(camelizeKeys)
  .transform(({ projApy, ...data }) => ({
    ...data,
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
    dt: timestamp,
  })
  .transform(camelizeKeys)
  .transform(({ gain, loss, currentDebt, totalRefunds, totalFees, protocolFees, dt, ...data }) => ({
    ...data,
    gain: BigInt(gain),
    loss: BigInt(loss),
    currentDebt: BigInt(currentDebt),
    totalRefunds: BigInt(totalRefunds),
    feesTotal: BigInt(totalFees),
    feesProtocol: BigInt(protocolFees),
    timestamp: dt,
  }))

export const getEventsResponse = z.object({
  count: z.number(),
  events: z.array(event),
})

export const getYieldResponse = z.object({ data: z.array(yieldData) }).transform(({ data }) => data)

export const getRevenueResponse = z
  .object({
    count: z.number(),
    total_distributed: z.string(),
    history: z.array(revenue),
  })
  .transform(camelizeKeys)
  .transform(({ count: _count, ...data }) => data)

export const getStatisticsResponse = z
  .object({
    last_updated: timestamp,
    last_updated_block: z.number(),
    proj_apy: z.number(),
    supply: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ projApy, ...data }) => ({
    ...data,
    apyProjected: projApy,
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
