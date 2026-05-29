import { z } from 'zod/v4'
import { address, camelizeKeys, timestamp } from '../schemas'

const token = z.object({ symbol: z.string(), address }).transform(
  ({ symbol, address }) =>
    ({
      symbol,
      address,
    }),
)

export const endpoint = z.enum(['crvusd', 'lending'])
export type Endpoint = z.infer<typeof endpoint>

const deposit = z.object({
  amount: z.number(),
  n1: z.number(),
  n2: z.number(),
})

const withdrawal = z
  .object({
    amount_borrowed: z.number(),
    amount_collateral: z.number(),
  })
  .transform(camelizeKeys)

const llammaEvent = z
  .object({
    provider: address,
    deposit: deposit.nullable(),
    withdrawal: withdrawal.nullable().optional(),
    block_number: z.number(),
    timestamp,
    transaction_hash: address,
  })
  .transform(camelizeKeys)
  .transform(({ deposit, withdrawal, transactionHash, ...data }) => ({
    ...data,
    deposit: deposit
      ? {
          amount: deposit.amount,
          n1: deposit.n1,
          n2: deposit.n2,
        }
      : null,
    withdrawal: withdrawal ?? null,
    txHash: transactionHash,
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
    timestamp,
    transaction_hash: address,
  })
  .transform(camelizeKeys)
  .transform(({ soldId, boughtId, tokenSold, tokenBought, feeX, feeY, transactionHash, ...data }) => ({
    ...data,
    idSold: soldId,
    idBought: boughtId,
    tokenSold: {
      symbol: tokenSold.symbol,
      address: tokenSold.address,
    },
    tokenBought: {
      symbol: tokenBought.symbol,
      address: tokenBought.address,
    },
    feeX: feeX ?? 0,
    feeY: feeY ?? 0,
    txHash: transactionHash,
  }))

const llammaOHLC = z
  .object({
    time: timestamp,
    open: z.number().nullable(),
    close: z.number().nullable(),
    high: z.number().nullable(),
    low: z.number().nullable(),
    base_price: z.number().nullable(),
    oracle_price: z.number().nullable(),
    volume: z.number().nullable(),
  })
  .transform(camelizeKeys)

export const getLlammaEventsResponse = z
  .object({
    data: z.array(llammaEvent),
    page: z.number().optional(),
    per_page: z.number().optional(),
    count: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ data: events, count, page, perPage }) => ({
    events,
    count,
    page: page ?? 1,
    perPage: perPage ?? events.length,
  }))

export const getLlammaTradesResponse = z
  .object({
    data: z.array(llammaTrade),
    page: z.number().optional(),
    per_page: z.number().optional(),
    count: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ data: trades, count, page, perPage }) => ({
    trades,
    count,
    page: page ?? 1,
    perPage: perPage ?? trades.length,
  }))

export const getLlammaOHLCResponse = z.object({ data: z.array(llammaOHLC) }).transform(({ data }) => data)

export type LlammaEvent = z.infer<typeof llammaEvent>
export type LlammaTrade = z.infer<typeof llammaTrade>
export type LlammaOHLC = z.infer<typeof llammaOHLC>
