import { toUTC } from '../timestamp'
import type * as Responses from './responses'
import type * as Models from './models'

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
  timestamp: toUTC(x.timestamp),
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
  timestamp: toUTC(x.timestamp),
  txHash: x.transaction_hash,
})

export const parseOHLC = (x: Responses.GetLlammaOHLCResponse['data'][number]): Models.LlammaOHLC => ({
  time: toUTC(x.time),
  open: x.open,
  close: x.close,
  high: x.high,
  low: x.low,
  basePrice: x.base_price,
  oraclePrice: x.oracle_price,
  volume: x.volume,
})
