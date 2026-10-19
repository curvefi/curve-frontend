import { isEqual } from 'lodash'
import { useMemo, useState } from 'react'
import { usePoolContext } from '@/dex/features/pool-context'
import type { Chain } from '@curvefi/prices-api'
import MenuItem from '@mui/material/MenuItem'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { Select } from '@ui/components/Select'
import { valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import type { LiquidityPair } from '@ui/features/pools/liquidity-density/types'
import { t } from '@ui/lib/i18n'
import { usePoolLiquidityDensity } from './hooks/usePoolLiquidityDensity'
import { LiquidityDensityChart } from './LiquidityDensityChart'

const PROFILE_OPTIONS = { points: 48 }

export const PoolLiquidityDensityChart = () => {
  const { chainId, blockchainId, poolId, poolAddress, pool } = usePoolContext()
  // Default to pricing the second wrapped coin in the first.
  const [selectedPair, setSelectedPair] = useState<LiquidityPair>([1, 0])
  // Density uses wrapped balances even when the pool form is showing underlying coins.
  const coins = pool.wrappedCoins
  const pairs = useMemo(
    () =>
      coins.flatMap((inputSymbol, inputCoin) =>
        coins.flatMap((outputSymbol, outputCoin) =>
          notFalsy(
            inputCoin !== outputCoin && {
              key: `${inputCoin}:${outputCoin}`,
              pair: [inputCoin, outputCoin] satisfies LiquidityPair,
              inputSymbol,
              outputSymbol,
            },
          ),
        ),
      ),
    [coins],
  )
  const { key, pair, inputSymbol, outputSymbol } = pairs.find(({ pair }) => isEqual(pair, selectedPair)) ?? pairs[0]

  const {
    profile: { data, error, isLoading },
    inputTokenUsdPrice,
  } = usePoolLiquidityDensity(
    { chainId, blockchainId: blockchainId as Chain, poolId, poolAddress },
    pair,
    PROFILE_OPTIONS,
  )
  const usdPrice = inputTokenUsdPrice.data
  const valuedProfile = useMemo(() => data && usdPrice && valueLiquidityProfile(data, usdPrice), [data, usdPrice])

  return (
    <LiquidityDensityChart
      profile={valuedProfile || data}
      inputSymbol={inputSymbol}
      outputSymbol={outputSymbol}
      unit={valuedProfile ? 'dollar' : { symbol: ` ${inputSymbol}`, position: 'suffix' }}
      oraclePrice={data?.oraclePrice}
      centerPrice={data?.centerPrice}
      isLoading={isLoading}
      error={error}
      action={
        <Select
          size="tiny"
          value={key}
          inputProps={{ 'aria-label': t`Liquidity pair` }}
          onChange={event =>
            maybe(
              pairs.find(({ key }) => key === event.target.value),
              ({ pair }) => setSelectedPair(pair),
            )
          }
        >
          {pairs.map(({ key, inputSymbol, outputSymbol }) => (
            <MenuItem key={key} value={key}>{`${inputSymbol} / ${outputSymbol}`}</MenuItem>
          ))}
        </Select>
      }
    />
  )
}
