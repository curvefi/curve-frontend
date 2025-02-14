import { toDate } from '../timestamp'
import type * as Responses from './responses'
import type * as Models from './models'

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
