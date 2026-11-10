import { isEqual } from 'lodash'
import { useMemo, useState } from 'react'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { maybe } from '@primitives/objects.utils'
import { ChartSelect } from '@ui/features/charts/ChartSelect'
import { valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'
import { combineQueries, useCombinedQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { usePoolLiquidityDensity } from './hooks/usePoolLiquidityDensity'
import { LiquidityDensityChart } from './LiquidityDensityChart'

export const PoolLiquidityDensityChart = () => {
  const { chainId, blockchainId, poolAddress, pool: pool } = usePoolContext()
  const { data: poolData, isLoading } = pool
  // Default to pricing the second wrapped coin in the first.
  const [selectedPair, setSelectedPair] = useState<LiquidityPair>([1, 0])
  // Density uses wrapped balances even when the pool form is showing underlying coins.
  const coins = poolData?.wrappedCoins
  const pairs = useMemo(
    () =>
      coins?.flatMap((inputSymbol, inputCoin) =>
        coins
          .map((outputSymbol, outputCoin) => ({
            key: `${inputCoin}:${outputCoin}`,
            pair: [inputCoin, outputCoin] satisfies LiquidityPair,
            inputSymbol,
            outputSymbol,
          }))
          .filter(({ pair: [inputCoin, outputCoin] }) => inputCoin !== outputCoin),
      ) ?? [],
    [coins],
  )
  const {
    key,
    pair = selectedPair,
    inputSymbol,
    outputSymbol,
  } = pairs.find(({ pair }) => isEqual(pair, selectedPair)) ?? pairs[0] ?? {}

  const { profile, oraclePrice, inputTokenUsdPrice, outputTokenUsdPrice } = usePoolLiquidityDensity(
    { chainId, blockchainId: getPricesApiBlockchainId(blockchainId), poolAddress },
    poolData,
    pair,
  )
  const valuedProfile = useCombinedQueries([profile, inputTokenUsdPrice, outputTokenUsdPrice], valueLiquidityProfile)

  return (
    <LiquidityDensityChart
      profile={combineQueries([pool, valuedProfile], (_pool, profile) => profile)}
      inputSymbol={inputSymbol}
      outputSymbol={outputSymbol}
      oraclePrice={combineQueries([oraclePrice, outputTokenUsdPrice], (price, usdRate) => price * usdRate)}
      centerPrice={combineQueries(
        [mapQuery(profile, p => p?.centerPrice), outputTokenUsdPrice],
        (price, usdRate) => price * usdRate,
      )}
      action={
        <ChartSelect
          options={pairs.map(({ key, inputSymbol, outputSymbol }) => ({
            value: key,
            label: `${inputSymbol} / ${outputSymbol}`,
          }))}
          activeOption={key}
          isLoading={isLoading}
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
