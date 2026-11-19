import { maxBy } from 'lodash'
import { useCallback } from 'react'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import type { Decimal } from '@primitives/decimal.utils'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'
import { combineQueries, useCombinedQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery } from '@ui/features/queries/util'
import { liquidityProbeAmount, processApiLiquidity, processConnectedLiquidity } from '../liquidity-density'
import { pairOraclePrice } from '../pool-oracle-price'
import { usePoolAmplification } from '../queries/pool-amplification.query'
import { usePoolInvariant } from '../queries/pool-invariant.query'
import { usePoolLiquidityQuote } from '../queries/pool-liquidity-quote.query'
import { usePoolStoredRates } from '../queries/pool-stored-rates.query'
import { usePoolWrappedBalances } from '../queries/pool-wrapped-balances.query'

/** Data and calculations only. Pair indices refer to the pool's wrapped coins, including metapool LP tokens. */
export const usePoolLiquidityDensity = ([inputCoin, outputCoin]: LiquidityPair, enabled?: boolean) => {
  const { chainId, blockchainId, poolAddress, pool, apiPool } = usePoolContext()
  const params = { chainId, blockchainId: getPricesApiBlockchainId(blockchainId), poolAddress }
  const metadata = usePoolMetadata(params, enabled)
  const snapshots = usePoolSnapshots(params, enabled)
  const balances = usePoolWrappedBalances(params, enabled)
  const parameters = usePoolParameters(params, enabled)
  const storedRates = usePoolStoredRates(params, enabled)
  const invariant = usePoolInvariant(params, enabled)
  const amplification = usePoolAmplification(params, enabled)
  const inputAmount = combineQueries([pool, balances], (pool, balances) =>
    liquidityProbeAmount(pool, balances, inputCoin),
  )
  const quote = usePoolLiquidityQuote({ ...params, inputCoin, outputCoin, inputAmount }, enabled)

  const onchainProfile = useCombinedQueries(
    [pool, balances, parameters, storedRates, invariant, amplification, metadata, quote, inputAmount],
    useCallback(
      (...results) => processConnectedLiquidity(...results, [inputCoin, outputCoin]),
      [inputCoin, outputCoin],
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
    oraclePrice: fallbackQ(
      mapQuery(parameters, ({ priceOracle }) =>
        pairOraclePrice(priceOracle as Decimal[] | undefined, [inputCoin, outputCoin]),
      ),
      mapQuery(snapshots, snapshots =>
        // Snapshot oracles use 18-decimal contract units; SDK parameters are already normalized.
        pairOraclePrice(
          maxBy(snapshots, 'timestamp')?.priceOracle?.map(price => price / 10 ** 18),
          [inputCoin, outputCoin],
        ),
      ),
    ),
    inputTokenUsdPrice: useTokenUsdRate(
      {
        ...params,
        tokenAddress: fallbackQ(
          mapQuery(pool, pool => pool.wrappedCoinAddresses[inputCoin]),
          mapQuery(apiPool, pool => pool.coins[inputCoin]?.address),
        ),
      },
      enabled,
    ),
    outputTokenUsdPrice: useTokenUsdRate(
      {
        ...params,
        tokenAddress: fallbackQ(
          mapQuery(pool, pool => pool.wrappedCoinAddresses[outputCoin]),
          mapQuery(apiPool, pool => pool.coins[outputCoin]?.address),
        ),
      },
      enabled,
    ),
  }
}
