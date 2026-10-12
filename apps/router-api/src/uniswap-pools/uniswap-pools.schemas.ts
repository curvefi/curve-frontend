export const UNISWAP_V3_POOLS_PATH = '/api/router/v1/uniswap-v3-pools'

export type UniswapV3PoolsQuery = { chainId: number }

const uniswapV3PoolsQuerySchema = {
  type: 'object',
  required: ['chainId'],
  additionalProperties: false,
  properties: { chainId: { type: 'integer', minimum: 1 } },
} as const

const poolStatsSchema = {
  type: 'object',
  required: ['tvlUsd', 'volumeUsd7d'],
  additionalProperties: false,
  properties: { tvlUsd: { type: 'number' }, volumeUsd7d: { type: ['number', 'null'] } },
} as const

export const UniswapV3PoolsOpts = {
  schema: {
    querystring: uniswapV3PoolsQuerySchema,
    // Keyed by `${token0}-${token1}-${fee}`, lowercase addresses and the fee tier in hundredths of a bip.
    response: { 200: { type: 'object', additionalProperties: poolStatsSchema } },
  },
} as const
