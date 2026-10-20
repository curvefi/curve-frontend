import { isEqual } from 'lodash'
import { useMemo, useState } from 'react'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { ChartSelect } from '@evm-ui/shared/ui/Chart/ChartSelect'
import { maybe } from '@primitives/objects.utils'
import { valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'
import { combineQueries, useCombinedQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { usePoolLiquidityDensity } from './hooks/usePoolLiquidityDensity'
import { LiquidityDensityChart } from './LiquidityDensityChart'

export const PoolLiquidityDensityChart = () => {
  const { chainId, blockchainId, poolAddress, pool } = usePoolContext()
  // Default to pricing the second wrapped coin in the first.
  const [selectedPair, setSelectedPair] = useState<LiquidityPair>([1, 0])
  // Density uses wrapped balances even when the pool form is showing underlying coins.
  const coins = pool.wrappedCoins
  const pairs = useMemo(
    () =>
      coins.flatMap((inputSymbol, inputCoin) =>
        coins
          .map((outputSymbol, outputCoin) => ({
            key: `${inputCoin}:${outputCoin}`,
            pair: [inputCoin, outputCoin] satisfies LiquidityPair,
            inputSymbol,
            outputSymbol,
          }))
          .filter(({ pair: [inputCoin, outputCoin] }) => inputCoin !== outputCoin),
      ),
    [coins],
  )
  const { key, pair, inputSymbol, outputSymbol } = pairs.find(({ pair }) => isEqual(pair, selectedPair)) ?? pairs[0]

  const { profile, inputTokenUsdPrice, outputTokenUsdPrice } = usePoolLiquidityDensity(
    { chainId, blockchainId: getPricesApiBlockchainId(blockchainId), poolAddress },
    pool,
    pair,
  )
  const valuedProfile = useCombinedQueries([profile, inputTokenUsdPrice, outputTokenUsdPrice], valueLiquidityProfile)

  return (
    <LiquidityDensityChart
      profile={valuedProfile}
      inputSymbol={inputSymbol}
      outputSymbol={outputSymbol}
      oraclePrice={combineQueries(
        [mapQuery(profile, data => data?.oraclePrice), outputTokenUsdPrice],
        (price, usdRate) => price * usdRate,
      )}
      centerPrice={combineQueries(
        [mapQuery(profile, data => data?.centerPrice), outputTokenUsdPrice],
        (price, usdRate) => price * usdRate,
      )}
      action={
        <ChartSelect
          options={pairs.map(({ key, inputSymbol, outputSymbol }) => ({
            value: key,
            label: `${inputSymbol} / ${outputSymbol}`,
          }))}
          activeOption={key}
          inputProps={{ 'aria-label': t`Liquidity pair` }}
          setActiveOption={key =>
            maybe(
              pairs.find(p => p.key === key),
              p => setSelectedPair(p.pair),
            )
          }
        />
      }
    />
  )
}
