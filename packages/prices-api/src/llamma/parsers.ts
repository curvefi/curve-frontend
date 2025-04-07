import { toDate } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

export const parseEvents = (x: Responses.GetLlammaEventsResponse['data'][number]): Models.LlammaEvent => ({
  provider: x.provider,
  deposit: x.deposit
    ? {
        amount: x.deposit.amount,
        n1: x.deposit.n1,
        n2: x.deposit.n2,
      }
    : null,
  withdrawal: x.withdrawal
    ? {
        amountBorrowed: x.withdrawal.amount_borrowed,
        amountCollateral: x.withdrawal.amount_collateral,
      }
    : null,
  blockNumber: x.block_number,
  timestamp: toDate(x.timestamp),
  txHash: x.transaction_hash,
})

export const parseTrades = (x: Responses.GetLlammaTradesResponse['data'][number]): Models.LlammaTrade => ({
  idSold: x.sold_id,
  idBought: x.bought_id,
  tokenSold: {
    symbol: x.token_sold.symbol,
    address: x.token_sold.address,
  },
  tokenBought: {
    symbol: x.token_bought.symbol,
    address: x.token_bought.address,
  },
  amountSold: x.amount_sold,
  amountBought: x.amount_bought,
  price: x.price,
  buyer: x.buyer,
  feeX: x.fee_x,
  feeY: x.fee_y,
  blockNumber: x.block_number,
  timestamp: toDate(x.timestamp),
  txHash: x.transaction_hash,
})

export const parseOHLC = (x: Responses.GetLlammaOHLCResponse['data'][number]): Models.LlammaOHLC => ({
  time: toDate(x.time),
  open: x.open ?? null,
  close: x.close ?? null,
  high: x.high ?? null,
  low: x.low ?? null,
  basePrice: x.base_price ?? null,
  oraclePrice: x.oracle_price ?? null,
  volume: x.volume ?? null,
})
