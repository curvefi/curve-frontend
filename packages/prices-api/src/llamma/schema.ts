import { z } from 'zod/v4'
import type { Token } from '@primitives/address.utils'
import { address, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const token = z.object({ symbol: z.string(), address }).transform(data => data as Token)

export const endpoint = z.enum(['crvusd', 'lending'])
export type Endpoint = z.infer<typeof endpoint>

const deposit = z.object({
  amount: z.number(),
  n1: z.number(),
  n2: z.number(),
})

const withdrawal = z.object({
  amount_borrowed: z.number(),
  amount_collateral: z.number(),
})

const llammaEvent = z
  .object({
    provider: address,
    deposit: deposit.nullable(),
    withdrawal: withdrawal.nullable().optional(),
    block_number: z.number(),
    timestamp: timestampResponse,
    transaction_hash: address,
  })
  .transform(data => ({
    provider: data.provider,
    deposit: data.deposit
      ? {
          amount: data.deposit.amount,
          n1: data.deposit.n1,
          n2: data.deposit.n2,
        }
      : null,
    withdrawal: data.withdrawal
      ? {
          amountBorrowed: data.withdrawal.amount_borrowed,
          amountCollateral: data.withdrawal.amount_collateral,
        }
      : null,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
    txHash: data.transaction_hash,
  }))

const llammaTrade = z
  .object({
    sold_id: z.number(),
    bought_id: z.number(),
    token_sold: token,
    token_bought: token,
    amount_sold: z.number(),
    amount_bought: z.number(),
    price: z.number(),
    buyer: address,
    fee_x: z.number().optional(),
    fee_y: z.number().optional(),
    block_number: z.number(),
    timestamp: timestampResponse,
    transaction_hash: address,
  })
  .transform(data => ({
    idSold: data.sold_id,
    idBought: data.bought_id,
    tokenSold: {
      symbol: data.token_sold.symbol,
      address: data.token_sold.address,
    },
    tokenBought: {
      symbol: data.token_bought.symbol,
      address: data.token_bought.address,
    },
    amountSold: data.amount_sold,
    amountBought: data.amount_bought,
    price: data.price,
    buyer: data.buyer,
    feeX: data.fee_x ?? 0,
    feeY: data.fee_y ?? 0,
    blockNumber: data.block_number,
    timestamp: parseTimestamp(data.timestamp),
    txHash: data.transaction_hash,
  }))

const llammaOHLC = z
  .object({
    time: timestampResponse,
    open: z.number().nullable(),
    close: z.number().nullable(),
    high: z.number().nullable(),
    low: z.number().nullable(),
    base_price: z.number().nullable(),
    oracle_price: z.number().nullable(),
    volume: z.number().nullable(),
  })
  .transform(data => ({
    time: parseTimestamp(data.time),
    open: data.open ?? null,
    close: data.close ?? null,
    high: data.high ?? null,
    low: data.low ?? null,
    basePrice: data.base_price ?? null,
    oraclePrice: data.oracle_price ?? null,
    volume: data.volume ?? null,
  }))

export const getLlammaEventsResponse = z
  .object({
    data: z.array(llammaEvent),
    page: z.number().optional(),
    per_page: z.number().optional(),
    count: z.number(),
  })
  .transform(data => ({
    events: data.data,
    count: data.count,
    page: data.page ?? 1,
    perPage: data.per_page ?? data.data.length,
  }))

export const getLlammaTradesResponse = z
  .object({
    data: z.array(llammaTrade),
    page: z.number().optional(),
    per_page: z.number().optional(),
    count: z.number(),
  })
  .transform(data => ({
    trades: data.data,
    count: data.count,
    page: data.page ?? 1,
    perPage: data.per_page ?? data.data.length,
  }))

export const getLlammaOHLCResponse = z
  .object({
    data: z.array(llammaOHLC),
  })
  .transform(data => data.data)

export type LlammaEvent = z.infer<typeof llammaEvent>
export type LlammaTrade = z.infer<typeof llammaTrade>
export type LlammaOHLC = z.infer<typeof llammaOHLC>
