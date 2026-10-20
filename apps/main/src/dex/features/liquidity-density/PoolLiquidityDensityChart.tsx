import { isEqual } from 'lodash'
import { useMemo, useState } from 'react'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { ChartSelect } from '@evm-ui/shared/ui/Chart/ChartSelect'
import { maybe, maybes } from '@primitives/objects.utils'
import { valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'
import { t } from '@ui/lib/i18n'
import { usePoolLiquidityDensity } from './hooks/usePoolLiquidityDensity'
import { LiquidityDensityChart } from './LiquidityDensityChart'

const PROFILE_OPTIONS = { points: 48 }

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

  const {
    profile: { data, error, isLoading },
    inputTokenUsdPrice: { data: usdPrice },
  } = usePoolLiquidityDensity(
    { chainId, blockchainId: getPricesApiBlockchainId(blockchainId), poolAddress },
    pool,
    pair,
    PROFILE_OPTIONS,
  )
  const valuedProfile = useMemo(() => maybes([data, usdPrice], valueLiquidityProfile), [data, usdPrice])

  return (
    <LiquidityDensityChart
      profile={valuedProfile ?? data}
      inputSymbol={inputSymbol}
      outputSymbol={outputSymbol}
      unit={valuedProfile ? 'dollar' : { symbol: ` ${inputSymbol}`, position: 'suffix' }}
      oraclePrice={data?.oraclePrice}
      centerPrice={data?.centerPrice}
      isLoading={isLoading}
      error={error}
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
