import { z } from 'zod/v4'
import { address, camelizeKeys, chain, sortDirection, timestamp } from '../schemas'

const rawCoin = z.object({
  pool_index: z.number(),
  symbol: z.string(),
  address,
})

const coin = rawCoin.transform(camelizeKeys)

const pool = z
  .object({
    name: z.string(),
    address,
    n_coins: z.number(),
    tvl_usd: z.number(),
    trading_volume_24h: z.number(),
    trading_fee_24h: z.number(),
    liquidity_volume_24h: z.number(),
    liquidity_fee_24h: z.number(),
    lp_token_address: address,
    lp_token_symbol: z.string(),
    lp_token_supply: z.number(),
    balances: z.array(z.number()).optional(),
    balances_usd: z.array(z.number().nullable()).optional(),
    coins: z.array(coin).optional(),
    base_daily_apr: z.number(),
    base_weekly_apr: z.number(),
    virtual_price: z.number(),
    pool_methods: z.array(z.string()).optional(),
  })
  .transform(camelizeKeys)
  .transform(({ nCoins, balances, balancesUsd, coins, poolMethods, ...data }) => ({
    ...data,
    numCoins: nCoins,
    balances: balances ?? [],
    balancesUsd: balancesUsd?.map(balance => balance ?? 0) ?? [],
    coins: coins ?? [],
    poolMethods: poolMethods ?? [],
  }))

const poolTotals = z
  .object({
    total_tvl: z.number(),
    trading_volume_24h: z.number(),
    trading_fee_24h: z.number(),
    liquidity_volume_24h: z.number(),
    liquidity_fee_24h: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ totalTvl, ...data }) => ({ ...data, tvl: totalTvl }))

const volume = z.object({
  timestamp,
  volume: z.number(),
  fees: z.number(),
})

const tvl = z
  .object({
    timestamp,
    tvl_usd: z.number().nullable().optional(),
    balances: z.array(z.number()),
    token_prices: z.array(z.number().nullable()),
  })
  .transform(camelizeKeys)
  .transform(({ timestamp, tvlUsd, balances, tokenPrices }) => ({
    timestamp,
    tvlUSD: tvlUsd ?? 0,
    balances: [...balances],
    tokenPrices: tokenPrices.map(price => price ?? 0),
  }))

const tradeToken = z
  .object({
    symbol: z.string(),
    address,
    pool_index: z.number(),
    event_index: z.number(),
  })
  .transform(camelizeKeys)

const poolTradeData = z
  .object({
    sold_id: z.number(),
    bought_id: z.number(),
    token_sold: address.optional(),
    token_bought: address.optional(),
    token_sold_symbol: z.string().optional(),
    token_bought_symbol: z.string().optional(),
    tokens_sold: z.number(),
    tokens_sold_usd: z.number().nullable(),
    tokens_bought: z.number(),
    tokens_bought_usd: z.number().nullable(),
    block_number: z.number(),
    time: timestamp,
    transaction_hash: address,
    buyer: address,
    usd_fee: z.number().nullable(),
  })
  .transform(camelizeKeys)

type TradeTokenData = z.infer<typeof tradeToken>
type PoolTradeData = z.infer<typeof poolTradeData>

const transformPoolTrade = (data: PoolTradeData, tokenSold?: TradeTokenData, tokenBought?: TradeTokenData) => ({
  soldId: data.soldId,
  boughtId: data.boughtId,
  tokenSold: data.tokenSold ?? requireTradeToken(tokenSold, data.soldId).address,
  tokenBought: data.tokenBought ?? requireTradeToken(tokenBought, data.boughtId).address,
  tokenSoldSymbol: data.tokenSoldSymbol ?? requireTradeToken(tokenSold, data.soldId).symbol,
  tokenBoughtSymbol: data.tokenBoughtSymbol ?? requireTradeToken(tokenBought, data.boughtId).symbol,
  tokensSold: data.tokensSold,
  tokensSoldUsd: data.tokensSoldUsd ?? 0,
  tokensBought: data.tokensBought,
  tokensBoughtUsd: data.tokensBoughtUsd ?? 0,
  blockNumber: data.blockNumber,
  time: data.time,
  txHash: data.transactionHash,
  buyer: data.buyer,
  usdFee: data.usdFee ?? 0,
})

const requireTradeToken = (token: TradeTokenData | undefined, tokenId: number) => {
  if (!token) {
    throw new Error(`Missing token metadata for pool trade token id ${tokenId}`)
  }

  return token
}

const getTradeToken = (tokenId: number, ...tokens: TradeTokenData[]) =>
  tokens.find(token => token.poolIndex === tokenId || token.eventIndex === tokenId)

const allPoolTrade = z
  .object({
    sold_id: z.number(),
    bought_id: z.number(),
    tokens_sold: z.number(),
    tokens_sold_usd: z.number().nullable(),
    tokens_bought: z.number(),
    tokens_bought_usd: z.number().nullable(),
    price: z.number(),
    block_number: z.number(),
    time: timestamp,
    transaction_hash: address,
    buyer: address,
    fee: z.number(),
    usd_fee: z.number().nullable(),
    token_sold: tradeToken,
    token_bought: tradeToken,
    pool_state: z.unknown().nullable(),
  })
  .transform(camelizeKeys)
  .transform(({ transactionHash, tokensSoldUsd, tokensBoughtUsd, usdFee, ...data }) => ({
    ...data,
    tokensSoldUsd: tokensSoldUsd ?? 0,
    tokensBoughtUsd: tokensBoughtUsd ?? 0,
    txHash: transactionHash,
    usdFee: usdFee ?? 0,
  }))

const poolLiquidityEventType = z.enum([
  'AddLiquidity',
  'RemoveLiquidity',
  'RemoveLiquidityOne',
  'RemoveLiquidityImbalance',
])
export type PoolLiquidityEventType = z.infer<typeof poolLiquidityEventType>

const poolLiquidityEvent = z
  .object({
    liquidity_event_type: poolLiquidityEventType,
    token_amounts: z.array(z.number()).nullable(),
    fees: z.array(z.number()).nullable(),
    token_supply: z.number().nullable(),
    block_number: z.number(),
    time: timestamp,
    transaction_hash: address,
    provider: address,
  })
  .transform(camelizeKeys)
  .transform(({ transactionHash, tokenAmounts, fees, tokenSupply, liquidityEventType, ...data }) => ({
    ...data,
    eventType: liquidityEventType,
    tokenAmounts: tokenAmounts ? [...tokenAmounts] : [],
    fees: fees ? [...fees] : [],
    tokenSupply: tokenSupply ?? 0,
    txHash: transactionHash,
  }))

const poolSnapshot = z
  .object({
    timestamp: z.number(),
    a: z.number().nullable(),
    fee: z.number().nullable(),
    admin_fee: z.number().nullable(),
    virtual_price: z.number().nullable(),
    xcp_profit: z.number().nullable(),
    xcp_profit_a: z.number().nullable(),
    base_daily_apr: z.number().nullable(),
    base_weekly_apr: z.number().nullable(),
    offpeg_fee_multiplier: z.number().nullable(),
    gamma: z.number().nullable(),
    mid_fee: z.number().nullable(),
    out_fee: z.number().nullable(),
    fee_gamma: z.number().nullable(),
    allowed_extra_profit: z.number().nullable(),
    adjustment_step: z.number().nullable(),
    ma_half_time: z.number().nullable(),
    price_scale: z.array(z.number()).nullable(),
    price_oracle: z.array(z.number()).nullable(),
    block_number: z.number().nullable(),
  })
  .transform(camelizeKeys)

const metadataCoin = rawCoin.extend({ decimals: z.number().nullable() }).transform(camelizeKeys)

const oracle = z
  .object({
    oracle_address: address.nullable(),
    method_id: z.string().nullable(),
    method: z.string().nullable(),
    is_verified: z.boolean(),
  })
  .transform(camelizeKeys)

const poolType = z.enum([
  'main',
  'crypto',
  'factory',
  'factory_crypto',
  'crvusd',
  'factory_tricrypto',
  'stableswapng',
  'twocryptong',
])
export type PoolType = z.infer<typeof poolType>
export type V2PoolFilterType = Extract<
  PoolType,
  'main' | 'factory' | 'crypto' | 'crvusd' | 'factory_tricrypto' | 'stableswapng'
>

const v2Coin = rawCoin
  .extend({
    name: z.string().nullable().optional(),
    decimals: z.number().nullable().optional(),
  })
  .transform(camelizeKeys)

const v2ExtraRewardApr = z
  .object({
    address: address.nullable().optional(),
    symbol: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    decimals: z.number().nullable().optional(),
    price: z.number().nullable().optional(),
    apr: z.number(),
  })
  .transform(camelizeKeys)

const v2Gauge = z
  .object({
    address,
    is_killed: z.boolean().optional(),
  })
  .transform(camelizeKeys)
  .transform(({ isKilled, ...data }) => ({
    ...data,
    isKilled: isKilled ?? false,
  }))

const v2Pool = z
  .object({
    chain_id: z.number(),
    name: z.string(),
    address,
    pool_type: poolType.nullable().optional(),
    is_metapool: z.boolean().nullable().optional(),
    base_pool: address.nullable().optional(),
    tvl_usd: z.number().nullable().optional(),
    trading_volume_24h: z.number(),
    trading_fee_24h: z.number(),
    liquidity_volume_24h: z.number(),
    liquidity_fee_24h: z.number(),
    coins: z.array(v2Coin),
    base_daily_apr: z.number().nullable().optional(),
    base_weekly_apr: z.number().nullable().optional(),
    crv_apr: z.number().nullable().optional(),
    crv_apr_boosted: z.number().nullable().optional(),
    extra_rewards_apr: z.array(v2ExtraRewardApr).optional(),
    vyper_version: z.string().nullable().optional(),
    gauges: z.array(v2Gauge).optional(),
  })
  .transform(camelizeKeys)
  .transform(({ extraRewardsApr, gauges, ...data }) => {
    const poolGauges = gauges ?? []

    return {
      ...data,
      extraRewardsApr: extraRewardsApr ?? [],
      gauge: poolGauges[0] ?? null,
      gauges: poolGauges,
    }
  })

const v2PoolRegistry = z
  .object({
    chain_id: z.number(),
    address,
    type: poolType,
  })
  .transform(camelizeKeys)

export const v2PoolSortField = z.enum(['name', 'base_daily_apr', 'volume', 'tvl'])
export type V2PoolSortField = z.infer<typeof v2PoolSortField>

export type SortDirection = z.infer<typeof sortDirection>

const v2PoolChain = z
  .object({
    chain_id: z.number(),
    name: z.string(),
  })
  .transform(camelizeKeys)

export const getPoolsResponse = z
  .object({
    chain,
    total: poolTotals,
    data: z.array(pool),
  })
  .transform(({ chain, total, data }) => ({
    chain,
    totals: total,
    pools: data,
  }))

export const getPoolResponse = pool
export const listPoolsResponse = z
  .object({
    page: z.number().optional(),
    pagination: z.number().optional(),
    count: z.number(),
    pools: z.array(v2Pool),
  })
  .transform(({ page, pagination, count, pools }) => ({
    page: page ?? 1,
    pagination: pagination ?? pools.length,
    count,
    pools,
  }))

export const listPoolRegistriesResponse = z
  .object({
    data: z.array(v2PoolRegistry),
  })
  .transform(({ data }) => data)

export const listPoolChainsResponse = z
  .object({
    data: z.array(v2PoolChain),
  })
  .transform(({ data }) => data)
export const getVolumeResponse = z.object({ data: z.array(volume) }).transform(({ data }) => data)
export const getTvlResponse = z.object({ data: z.array(tvl) }).transform(({ data }) => data)

export const getPoolTradesResponse = z
  .object({
    chain,
    address,
    main_token: tradeToken,
    reference_token: tradeToken,
    data: z.array(poolTradeData),
    page: z.number().optional(),
    per_page: z.number().optional(),
    count: z.number().optional(),
  })
  .transform(camelizeKeys)
  .transform(({ data: trades, page, perPage, count, ...data }) => ({
    ...data,
    trades: trades.map(trade =>
      transformPoolTrade(
        trade,
        getTradeToken(trade.soldId, data.mainToken, data.referenceToken),
        getTradeToken(trade.boughtId, data.mainToken, data.referenceToken),
      ),
    ),
    page: page ?? 1,
    perPage: perPage ?? trades.length,
    count: count ?? trades.length,
  }))

export const getAllPoolTradesResponse = z
  .object({
    chain,
    address,
    data: z.array(allPoolTrade),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ data: trades, ...data }) => ({ ...data, trades }))

export const getPoolLiquidityEventsResponse = z
  .object({
    chain,
    address,
    data: z.array(poolLiquidityEvent),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(camelizeKeys)
  .transform(({ data: events, ...data }) => ({
    ...data,
    events,
  }))

export const getPoolSnapshotsResponse = z
  .object({
    chain: z.string(),
    address: z.string(),
    data: z.array(poolSnapshot),
  })
  .transform(({ data }) => data)

export const getPoolMetadataResponse = z
  .object({
    name: z.string(),
    registry: z.string(),
    registry_type: z.string(),
    lp_token_address: address,
    coins: z.array(metadataCoin),
    gauges: z.array(z.string()),
    pool_type: poolType,
    metapool: z.boolean(),
    base_pool: z.string().nullable(),
    asset_types: z.array(z.number()).nullable(),
    oracles: z.array(oracle.nullable()).nullable(),
    vyper_version: z.string().nullable(),
    deployment_tx: z.string().nullable(),
    deployment_block: z.number().nullable(),
    deployment_date: timestamp.nullable(),
    has_donations: z.boolean(),
  })
  .transform(camelizeKeys)
  .transform(({ deploymentDate, gauges, assetTypes, oracles = null, ...data }) => ({
    ...data,
    gauges: [...gauges],
    assetTypes: assetTypes ? [...assetTypes] : null,
    oracles,
    deploymentDate: deploymentDate ?? null,
  }))

export type PoolCoin = z.infer<typeof pool>['coins'][number]
export type PoolsTotals = z.infer<typeof poolTotals>
export type Pool = z.infer<typeof pool>
export type V2Gauge = z.infer<typeof v2Gauge>
export type V2Pool = z.infer<typeof v2Pool>
export type V2PoolRegistry = z.infer<typeof v2PoolRegistry>
export type V2PoolChain = z.infer<typeof v2PoolChain>
export type Volume = z.infer<typeof volume>
export type Tvl = z.infer<typeof tvl>
export type TradeToken = z.infer<typeof tradeToken>
export type PoolTrade = ReturnType<typeof transformPoolTrade>
export type AllPoolTrade = z.infer<typeof allPoolTrade>
export type PoolLiquidityEvent = z.infer<typeof poolLiquidityEvent>
export type PoolSnapshot = z.infer<typeof poolSnapshot>
export type MetadataCoin = z.infer<typeof metadataCoin>
export type Oracle = z.infer<typeof oracle>
export type PoolMetadata = z.infer<typeof getPoolMetadataResponse>
