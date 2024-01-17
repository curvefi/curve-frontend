import type { SWRSubscriptionResponse } from 'swr/subscription'

import networks from '@/networks'

// subscribe: stream data in real time from the moment you subscribe
// snapshots: retrieve historical data
type Action = 'subscribe' | 'snapshots'
type Interval = 900 | 3600 | 14400 | 86400
type PriceUnits = 'usd' | 'token0'

function getResponseData(resp: SWRSubscriptionResponse) {
  try {
    return JSON.parse(resp.data)
  } catch (error) {
    console.log('resp data error', resp.error)
  }
}

// https://curve-prices.gitbook.io/curve-prices-websocket-documentation/reference/channels/curve-pool-channels/pool_ohlc
function poolOhlcPrices(
  action: Action,
  chainId: ChainId,
  pool: string,
  main_token: string,
  reference_token: string,
  interval: Interval,
  start?: number,
  end?: number
) {
  // snapshots
  if (start && end) {
    return buildFn(action, 'pool_ohlc', [
      {
        pool: pool,
        chain: getChain(chainId),
        main_token: main_token,
        reference_token: reference_token,
        interval: interval,
        start: start,
        end: end,
      },
    ])
  }

  // subscribe
  return buildFn(action, 'pool_ohlc', [
    {
      pool: pool,
      chain: getChain(chainId),
      main_token: main_token,
      reference_token: reference_token,
      interval: interval,
    },
  ])
}

// https://curve-prices.gitbook.io/curve-prices-websocket-documentation/reference/channels/curve-pool-channels/pool_lp_ohlc
function poolLpOhlcPrices(
  action: Action,
  chainId: ChainId,
  pool: string,
  price_units: PriceUnits,
  interval: Interval,
  start?: number,
  end?: number
) {
  // snapshots
  if (start && end) {
    return buildFn(action, 'pool_lp_ohlc', [
      {
        pool: pool,
        chain: getChain(chainId),
        price_units: price_units,
        interval: interval,
        start: start,
        end: end,
      },
    ])
  }

  // subscribe
  return buildFn(action, 'pool_lp_ohlc', [
    {
      pool: pool,
      chain: getChain(chainId),
      price_units: price_units,
      interval: interval,
    },
  ])
}

function poolTrades(action: Action, chainId: ChainId, pool: string, page?: number, pagination?: number) {
  // snapshots
  if (page && pagination) {
    return buildFn(action, 'pool_trades', [
      {
        pool: pool,
        chain: getChain(chainId),
        pagination: {
          page: 1,
          pagination: 100,
        },
      },
    ])
  }

  // subscribe
  return buildFn(action, 'pool_trades', [
    {
      pool: pool,
      chain: getChain(chainId),
    },
  ])
}

function poolLiquidityEvents(action: Action, chainId: ChainId, pool: string, page?: number, pagination?: number) {
  // snapshots
  if (page && pagination) {
    return buildFn(action, 'pool_liquidity_events', [
      {
        pool: pool,
        chain: getChain(chainId),
        pagination: {
          page: 1,
          pagination: 100,
        },
      },
    ])
  }

  // subscribe
  return buildFn(action, 'pool_liquidity_events', [
    {
      pool: pool,
      chain: getChain(chainId),
    },
  ])
}

function poolSnapshots(pool: string, chainId: ChainId, start: number, end: number) {
  return buildFn('snapshots', 'pool_snapshots', [
    {
      pool,
      chain: getChain(chainId),
      start,
      end,
    },
  ])
}

const channels = {
  helpers: {
    getResponseData,
  },
  poolOhlcPrices,
  poolLpOhlcPrices,
  poolTrades,
  poolLiquidityEvents,
  poolSnapshots,
}

export default channels

// helpers
function buildFn<T>(action: Action, channel: string, settings: T) {
  return JSON.stringify({ action, channel, settings })
}

function getChain(chainId: ChainId) {
  return networks[chainId].id.toLowerCase()
}
