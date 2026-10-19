import { useCallback } from 'react'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { ChainNameQuery, PoolQuery } from '@evm-ui/queries/query-types'
import { maybe } from '@primitives/objects.utils'
import type { LiquidityPair, LiquidityProfileOptions } from '@ui/features/pools/liquidity-density/types'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'
import {
  liquidityProbeAmount,
  liquidityTokenUsdPrice,
  processApiLiquidity,
  processConnectedLiquidity,
} from '../liquidity-density'
import { usePoolLiquidityQuote } from '../queries/pool-liquidity-quote.query'
import { usePoolLiquidityState } from '../queries/pool-liquidity-state.query'

type PoolLiquidityParams = FieldsOf<PoolQuery & ChainNameQuery>

/** Data and calculations only. Pair indices refer to the pool's wrapped coins, including metapool LP tokens. */
export const usePoolLiquidityDensity = (
  params: PoolLiquidityParams,
  [inputCoin, outputCoin]: LiquidityPair,
  { low, high, points }: LiquidityProfileOptions = {},
  enabled = true,
) => {
  const { poolAddress } = params
  const pool = usePoolPricesApi({ ...params, poolAddress: poolAddress ?? undefined }, enabled)
  const metadata = usePoolMetadata(params, enabled)
  const snapshots = usePoolSnapshots(params, enabled)
  const onchain = usePoolLiquidityState(params, enabled)
  const inputAmount = maybe(onchain.data, state => liquidityProbeAmount(state, inputCoin))
  const quote = usePoolLiquidityQuote({ ...params, inputCoin, outputCoin, inputAmount }, enabled)

  const onchainProfile = useCombinedQueries(
    [onchain, metadata, quote],
    useCallback(
      (state, metadata, quote) =>
        processConnectedLiquidity(state, metadata, quote, [inputCoin, outputCoin], { low, high, points }),
      [inputCoin, outputCoin, low, high, points],
    ),
  )
  const apiProfile = useCombinedQueries(
    [pool, metadata, snapshots],
    useCallback(
      (pool, metadata, snapshots) =>
        processApiLiquidity(pool, metadata, snapshots, [inputCoin, outputCoin], { low, high, points }),
      [inputCoin, outputCoin, low, high, points],
    ),
  )
  const profile = fallbackQ(onchainProfile, apiProfile)

  return {
    profile,
    // Valuation is independent: changing units must not rerun the numerical solver.
    inputTokenUsdPrice: mapQuery(pool, pool => {
      const coinAddress =
        profile.data?.source === 'rpc'
          ? onchain.data?.wrappedCoinAddresses[inputCoin]
          : pool.coins.find(c => c.poolIndex === inputCoin)?.address
      return maybe(coinAddress, address => liquidityTokenUsdPrice(pool, inputCoin, address))
    }),
  }
}
