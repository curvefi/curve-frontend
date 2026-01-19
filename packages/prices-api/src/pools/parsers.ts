import { toDate } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

export const parsePoolTotals = (x: Responses.GetPoolsResponse['total']): Models.PoolsTotals => ({
  tvl: x.total_tvl,
  tradingVolume24h: x.trading_volume_24h,
  tradingFee24h: x.trading_fee_24h,
  liquidityVolume24h: x.liquidity_volume_24h,
  liquidityFee24h: x.liquidity_fee_24h,
})

export const parsePool = (x: Responses.GetPoolsResponse['data'][number]): Models.Pool => ({
  name: x.name,
  address: x.address,
  numCoins: x.n_coins,
  tvlUsd: x.tvl_usd,
  tradingVolume24h: x.trading_volume_24h,
  tradingFee24h: x.trading_fee_24h,
  liquidityVolume24h: x.liquidity_volume_24h,
  liquidityFee24h: x.liquidity_fee_24h,
  coins:
    x.coins?.map((coin) => ({
      poolIndex: coin.pool_index,
      symbol: coin.symbol,
      address: coin.address,
    })) ?? [],
  baseDailyApr: x.base_daily_apr,
  baseWeeklyApr: x.base_weekly_apr,
  virtualPrice: x.virtual_price,
  poolMethods: x.pool_methods?.map((x) => x) ?? [],
})

export const parseVolume = (x: Responses.GetVolumeResponse['data'][number]): Models.Volume => ({
  timestamp: toDate(x.timestamp),
  volume: x.volume,
  fees: x.fees,
})

export const parseTvl = (x: Responses.GetTvlResponse['data'][number]): Models.Tvl => ({
  timestamp: toDate(x.timestamp),
  tvlUSD: x.tvl_usd ?? 0,
  balances: [...x.balances],
  tokenPrices: [...x.token_prices],
})

export const parseTradeToken = (x: Responses.GetPoolTradesResponse['main_token']): Models.TradeToken => ({
  symbol: x.symbol,
  address: x.address,
  poolIndex: x.pool_index,
  eventIndex: x.event_index,
})

export const parsePoolTrade = (x: Responses.GetPoolTradesResponse['data'][number]): Models.PoolTrade => ({
  soldId: x.sold_id,
  boughtId: x.bought_id,
  tokenSold: x.token_sold,
  tokenBought: x.token_bought,
  tokenSoldSymbol: x.token_sold_symbol,
  tokenBoughtSymbol: x.token_bought_symbol,
  tokensSold: x.tokens_sold,
  tokensSoldUsd: x.tokens_sold_usd,
  tokensBought: x.tokens_bought,
  tokensBoughtUsd: x.tokens_bought_usd,
  blockNumber: x.block_number,
  time: toDate(x.time),
  txHash: x.transaction_hash,
  buyer: x.buyer,
  usdFee: x.usd_fee,
})

export const parseAllPoolTrade = (x: Responses.GetAllPoolTradesResponse['data'][number]): Models.AllPoolTrade => ({
  soldId: x.sold_id,
  boughtId: x.bought_id,
  tokensSold: x.tokens_sold,
  tokensSoldUsd: x.tokens_sold_usd,
  tokensBought: x.tokens_bought,
  tokensBoughtUsd: x.tokens_bought_usd,
  price: x.price,
  blockNumber: x.block_number,
  time: toDate(x.time),
  txHash: x.transaction_hash,
  buyer: x.buyer,
  fee: x.fee,
  usdFee: x.usd_fee,
  tokenSold: parseTradeToken(x.token_sold),
  tokenBought: parseTradeToken(x.token_bought),
  poolState: x.pool_state,
})

export const parsePoolLiquidityEvent = (
  x: Responses.GetPoolLiquidityEventsResponse['data'][number],
): Models.PoolLiquidityEvent => ({
  eventType: x.liquidity_event_type as Models.PoolLiquidityEventType,
  tokenAmounts: x.token_amounts ? [...x.token_amounts] : [],
  fees: x.fees ? [...x.fees] : [],
  tokenSupply: x.token_supply,
  blockNumber: x.block_number,
  time: toDate(x.time),
  txHash: x.transaction_hash,
  provider: x.provider,
})
