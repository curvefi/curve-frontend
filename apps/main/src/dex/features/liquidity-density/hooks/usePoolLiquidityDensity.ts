import { useCallback } from 'react'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { ChainNameQuery, PoolQuery } from '@evm-ui/queries/query-types'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { maybes } from '@primitives/objects.utils'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { fallbackQ } from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'
import { liquidityProbeAmount, processApiLiquidity, processConnectedLiquidity } from '../liquidity-density'
import { usePoolAmplification } from '../queries/pool-amplification.query'
import { usePoolInvariant } from '../queries/pool-invariant.query'
import { usePoolLiquidityQuote } from '../queries/pool-liquidity-quote.query'
import { usePoolStoredRates } from '../queries/pool-stored-rates.query'
import { usePoolWrappedBalances } from '../queries/pool-wrapped-balances.query'

type PoolLiquidityParams = FieldsOf<PoolQuery & ChainNameQuery>

/** Data and calculations only. Pair indices refer to the pool's wrapped coins, including metapool LP tokens. */
export const usePoolLiquidityDensity = (
  params: PoolLiquidityParams,
  pool: PoolTemplate | undefined,
  [inputCoin, outputCoin]: LiquidityPair,
  enabled = true,
) => {
  const apiPool = usePoolPricesApi({ ...params, poolAddress: params.poolAddress })
  const metadata = usePoolMetadata(params, enabled)
  const snapshots = usePoolSnapshots(params, enabled)
  const balances = usePoolWrappedBalances(params, enabled)
  const parameters = usePoolParameters(params, enabled)
  const storedRates = usePoolStoredRates(params, enabled)
  const invariant = usePoolInvariant(params, enabled)
  const amplification = usePoolAmplification(params, enabled)
  const inputAmount = maybes([pool, balances.data], (pool, balances) => liquidityProbeAmount(pool, balances, inputCoin))
  const quote = usePoolLiquidityQuote({ ...params, inputCoin, outputCoin, inputAmount }, enabled)

  const onchainProfile = useCombinedQueries(
    [balances, parameters, storedRates, invariant, amplification, metadata, quote],
    useCallback(
      (...results) =>
        maybes([pool, inputAmount], (pool, inputAmount) =>
          processConnectedLiquidity(pool, ...results, inputAmount, [inputCoin, outputCoin]),
        ),
      [pool, inputAmount, inputCoin, outputCoin],
    ),
  )
  const apiProfile = useCombinedQueries(
    [apiPool, metadata, snapshots],
    useCallback(
      (pool, metadata, snapshots) => processApiLiquidity(pool, metadata, snapshots, [inputCoin, outputCoin]),
      [inputCoin, outputCoin],
    ),
  )

  return {
    profile: fallbackQ(onchainProfile, apiProfile),
    inputTokenUsdPrice: useTokenUsdRate(
      { ...params, tokenAddress: pool?.wrappedCoinAddresses[inputCoin] ?? apiPool.data?.coins[inputCoin]?.address },
      enabled,
    ),
    outputTokenUsdPrice: useTokenUsdRate(
      { ...params, tokenAddress: pool?.wrappedCoinAddresses[outputCoin] ?? apiPool.data?.coins[outputCoin]?.address },
      enabled,
    ),
  }
}
