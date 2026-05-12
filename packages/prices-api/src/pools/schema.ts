import { z } from 'zod/v4'
import { address, chain, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const coin = z.object({
  pool_index: z.number(),
  symbol: z.string(),
  address,
})

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
    coins: z.array(coin).optional(),
    base_daily_apr: z.number(),
    base_weekly_apr: z.number(),
    virtual_price: z.number(),
    pool_methods: z.array(z.string()).optional(),
  })
  .transform(data => ({
    name: data.name,
    address: data.address,
    numCoins: data.n_coins,
    tvlUsd: data.tvl_usd,
    tradingVolume24h: data.trading_volume_24h,
    tradingFee24h: data.trading_fee_24h,
    liquidityVolume24h: data.liquidity_volume_24h,
    liquidityFee24h: data.liquidity_fee_24h,
    coins: data.coins?.map(item => ({ poolIndex: item.pool_index, symbol: item.symbol, address: item.address })) ?? [],
    baseDailyApr: data.base_daily_apr,
    baseWeeklyApr: data.base_weekly_apr,
    virtualPrice: data.virtual_price,
    poolMethods: data.pool_methods?.map(item => item) ?? [],
  }))

const poolTotals = z
  .object({
    total_tvl: z.number(),
    trading_volume_24h: z.number(),
    trading_fee_24h: z.number(),
    liquidity_volume_24h: z.number(),
    liquidity_fee_24h: z.number(),
  })
  .transform(data => ({
    tvl: data.total_tvl,
    tradingVolume24h: data.trading_volume_24h,
    tradingFee24h: data.trading_fee_24h,
    liquidityVolume24h: data.liquidity_volume_24h,
    liquidityFee24h: data.liquidity_fee_24h,
  }))

const volume = z
  .object({
    timestamp: timestampResponse,
    volume: z.number(),
    fees: z.number(),
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.timestamp),
    volume: data.volume,
    fees: data.fees,
  }))

const tvl = z
  .object({
    timestamp: timestampResponse,
    tvl_usd: z.number().optional(),
    balances: z.array(z.number()),
    token_prices: z.array(z.number()),
  })
  .transform(data => ({
    timestamp: parseTimestamp(data.timestamp),
    tvlUSD: data.tvl_usd ?? 0,
    balances: [...data.balances],
    tokenPrices: [...data.token_prices],
  }))

const tradeToken = z
  .object({
    symbol: z.string(),
    address,
    pool_index: z.number(),
    event_index: z.number(),
  })
  .transform(data => ({
    symbol: data.symbol,
    address: data.address,
    poolIndex: data.pool_index,
    eventIndex: data.event_index,
  }))

const poolTradeData = z.object({
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
  time: timestampResponse,
  transaction_hash: address,
  buyer: address,
  usd_fee: z.number().nullable(),
})

type TradeTokenData = z.infer<typeof tradeToken>
type PoolTradeData = z.infer<typeof poolTradeData>

const transformPoolTrade = (
  data: PoolTradeData,
  tokenSold?: TradeTokenData,
  tokenBought?: TradeTokenData,
) => ({
    soldId: data.sold_id,
    boughtId: data.bought_id,
    tokenSold: data.token_sold ?? requireTradeToken(tokenSold, data.sold_id).address,
    tokenBought: data.token_bought ?? requireTradeToken(tokenBought, data.bought_id).address,
    tokenSoldSymbol: data.token_sold_symbol ?? requireTradeToken(tokenSold, data.sold_id).symbol,
    tokenBoughtSymbol: data.token_bought_symbol ?? requireTradeToken(tokenBought, data.bought_id).symbol,
    tokensSold: data.tokens_sold,
    tokensSoldUsd: data.tokens_sold_usd ?? 0,
    tokensBought: data.tokens_bought,
    tokensBoughtUsd: data.tokens_bought_usd ?? 0,
    blockNumber: data.block_number,
    time: parseTimestamp(data.time),
    txHash: data.transaction_hash,
    buyer: data.buyer,
    usdFee: data.usd_fee ?? 0,
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
    time: timestampResponse,
    transaction_hash: address,
    buyer: address,
    fee: z.number(),
    usd_fee: z.number().nullable(),
    token_sold: tradeToken,
    token_bought: tradeToken,
    pool_state: z.unknown().nullable(),
  })
  .transform(data => ({
    soldId: data.sold_id,
    boughtId: data.bought_id,
    tokensSold: data.tokens_sold,
    tokensSoldUsd: data.tokens_sold_usd ?? 0,
    tokensBought: data.tokens_bought,
    tokensBoughtUsd: data.tokens_bought_usd ?? 0,
    price: data.price,
    blockNumber: data.block_number,
    time: parseTimestamp(data.time),
    txHash: data.transaction_hash,
    buyer: data.buyer,
    fee: data.fee,
    usdFee: data.usd_fee ?? 0,
    tokenSold: data.token_sold,
    tokenBought: data.token_bought,
    poolState: data.pool_state,
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
    time: timestampResponse,
    transaction_hash: address,
    provider: address,
  })
  .transform(data => ({
    eventType: data.liquidity_event_type,
    tokenAmounts: data.token_amounts ? [...data.token_amounts] : [],
    fees: data.fees ? [...data.fees] : [],
    tokenSupply: data.token_supply ?? 0,
    blockNumber: data.block_number,
    time: parseTimestamp(data.time),
    txHash: data.transaction_hash,
    provider: data.provider,
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
  .transform(data => ({
    timestamp: data.timestamp,
    a: data.a,
    fee: data.fee,
    adminFee: data.admin_fee,
    virtualPrice: data.virtual_price,
    xcpProfit: data.xcp_profit,
    xcpProfitA: data.xcp_profit_a,
    baseDailyApr: data.base_daily_apr,
    baseWeeklyApr: data.base_weekly_apr,
    offpegFeeMultiplier: data.offpeg_fee_multiplier,
    gamma: data.gamma,
    midFee: data.mid_fee,
    outFee: data.out_fee,
    feeGamma: data.fee_gamma,
    allowedExtraProfit: data.allowed_extra_profit,
    adjustmentStep: data.adjustment_step,
    maHalfTime: data.ma_half_time,
    priceScale: data.price_scale,
    priceOracle: data.price_oracle,
    blockNumber: data.block_number,
  }))

const metadataCoin = coin
  .extend({
    decimals: z.number().nullable(),
  })
  .transform(data => ({
    poolIndex: data.pool_index,
    symbol: data.symbol,
    address: data.address,
    decimals: data.decimals,
  }))

const oracle = z
  .object({
    oracle_address: address.nullable(),
    method_id: z.string().nullable(),
    method: z.string().nullable(),
    is_verified: z.boolean(),
  })
  .transform(data => ({
    oracleAddress: data.oracle_address,
    methodId: data.method_id,
    method: data.method,
    isVerified: data.is_verified,
  }))

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

export const getPoolsResponse = z
  .object({
    chain,
    total: poolTotals,
    data: z.array(pool),
  })
  .transform(data => ({
    chain: data.chain,
    totals: data.total,
    pools: data.data,
  }))

export const getPoolResponse = pool

export const getVolumeResponse = z
  .object({
    data: z.array(volume),
  })
  .transform(data => data.data)

export const getTvlResponse = z
  .object({
    data: z.array(tvl),
  })
  .transform(data => data.data)

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
  .transform(data => ({
    chain: data.chain,
    address: data.address,
    mainToken: data.main_token,
    referenceToken: data.reference_token,
    trades: data.data.map(trade =>
      transformPoolTrade(
        trade,
        getTradeToken(trade.sold_id, data.main_token, data.reference_token),
        getTradeToken(trade.bought_id, data.main_token, data.reference_token),
      ),
    ),
    page: data.page ?? 1,
    perPage: data.per_page ?? data.data.length,
    count: data.count ?? data.data.length,
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
  .transform(data => ({
    chain: data.chain,
    address: data.address,
    trades: data.data,
    page: data.page,
    perPage: data.per_page,
    count: data.count,
  }))

export const getPoolLiquidityEventsResponse = z
  .object({
    chain,
    address,
    data: z.array(poolLiquidityEvent),
    page: z.number(),
    per_page: z.number(),
    count: z.number(),
  })
  .transform(data => ({
    ...data,
    events: data.data,
  }))

export const getPoolSnapshotsResponse = z
  .object({
    chain: z.string(),
    address: z.string(),
    data: z.array(poolSnapshot),
  })
  .transform(data => data.data)

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
    deployment_date: timestampResponse.nullable(),
    has_donations: z.boolean(),
  })
  .transform(data => ({
    name: data.name,
    registry: data.registry,
    registryType: data.registry_type,
    lpTokenAddress: data.lp_token_address,
    coins: data.coins,
    gauges: [...data.gauges],
    poolType: data.pool_type,
    metapool: data.metapool,
    basePool: data.base_pool,
    assetTypes: data.asset_types ? [...data.asset_types] : null,
    oracles: data.oracles?.map(item => (item ? item : null)) ?? null,
    vyperVersion: data.vyper_version,
    deploymentTx: data.deployment_tx,
    deploymentBlock: data.deployment_block,
    deploymentDate: data.deployment_date ? parseTimestamp(data.deployment_date) : null,
    hasDonations: data.has_donations,
  }))

export type PoolCoin = z.infer<typeof pool>['coins'][number]
export type PoolsTotals = z.infer<typeof poolTotals>
export type Pool = z.infer<typeof pool>
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
