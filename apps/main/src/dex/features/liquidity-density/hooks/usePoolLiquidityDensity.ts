import { useCallback } from 'react'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { ChainNameQuery, PoolQuery } from '@evm-ui/queries/query-types'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { maybe } from '@primitives/objects.utils'
import type { LiquidityPair, LiquidityProfileOptions } from '@ui/features/pools/liquidity-density/types'
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
  [inputCoin, outputCoin]: LiquidityPair,
  { low, high, points }: LiquidityProfileOptions = {},
  enabled = true,
) => {
  const pool = usePoolPricesApi({ ...params, poolAddress: params.poolAddress }, enabled)
  const metadata = usePoolMetadata(params, enabled)
  const snapshots = usePoolSnapshots(params, enabled)
  const balances = usePoolWrappedBalances(params, enabled)
  const parameters = usePoolParameters(params, enabled)
  const storedRates = usePoolStoredRates(params, enabled)
  const invariant = usePoolInvariant(params, enabled)
  const amplification = usePoolAmplification(params, enabled)
  const inputAmount = maybe(balances.data, balances => liquidityProbeAmount(balances, inputCoin))
  const quote = usePoolLiquidityQuote({ ...params, inputCoin, outputCoin, inputAmount }, enabled)

  const onchainProfile = useCombinedQueries(
    [balances, parameters, storedRates, invariant, amplification, metadata, quote],
    useCallback(
      (...results) => processConnectedLiquidity(...results, [inputCoin, outputCoin], { low, high, points }),
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

  const tokenAddress = balances.data?.wrappedCoinAddresses[inputCoin] ?? pool.data?.coins[inputCoin]?.address
  return {
    profile: fallbackQ(onchainProfile, apiProfile),
    inputTokenUsdPrice: useTokenUsdRate({ ...params, tokenAddress }, enabled),
  }
}
