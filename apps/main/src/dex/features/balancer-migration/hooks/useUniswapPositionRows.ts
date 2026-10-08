import { useMemo } from 'react'
import { useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import type { Address } from '@primitives/address.utils'
import { maybes } from '@primitives/objects.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { getUniswapPoolStatsKey } from '../api/uniswap-pools.api'
import { estimateUniswapFeeApr, type UniswapPosition } from '../api/uniswap.api'
import { useUniswapV3Pools } from '../queries/uniswap-pools.query'
import { useUniswapPositions } from '../queries/uniswap-positions.query'

/** USD values are undefined while a token has no price, rather than counting that token as zero. */
export type UniswapPositionRow = UniswapPosition & {
  name: string
  valueUsd: number | undefined
  feesUsd: number | undefined
  /** Position plus unclaimed fees: everything the migration moves. */
  totalUsd: number | undefined
  /** Estimated fee APR in percent; undefined without DefiLlama volume for the pool. */
  feeApr: number | undefined
}

const sumUsd = (amounts: readonly string[], rates: (number | undefined)[]) =>
  rates.every(rate => rate != null) ? amounts.reduce((sum, amount, i) => sum + +amount * rates[i], 0) : undefined

export const useUniswapPositionRows = (
  { chainId, userAddress }: { chainId: number | undefined; userAddress: Address | undefined },
  enabled: boolean,
) => {
  const positions = useUniswapPositions({ chainId, userAddress }, enabled)
  const tokenAddresses = useMemo(
    () => positions.data?.flatMap(({ tokens }) => tokens.map(({ address }) => address)),
    [positions.data],
  )
  const rates = useTokenUsdRates({ chainId, tokenAddresses }, enabled && !!tokenAddresses?.length)
  const poolStats = useUniswapV3Pools({ chainId }, enabled)
  const query = mapQuery(q(positions), data =>
    data
      .map((position): UniswapPositionRow => {
        const tokenRates = position.tokens.map(({ address }) => rates[address]?.data ?? undefined)
        const valueUsd = sumUsd(position.amounts, tokenRates)
        const feesUsd = sumUsd(position.fees, tokenRates)
        return {
          ...position,
          name: position.tokens.map(({ symbol }) => symbol).join('/'),
          valueUsd,
          feesUsd,
          totalUsd: maybes([valueUsd, feesUsd], (value, fees) => value + fees),
          feeApr: maybes(
            [poolStats.data?.[getUniswapPoolStatsKey(position)]?.volumeUsd7d, valueUsd],
            (volumeUsd7d, positionValueUsd) => estimateUniswapFeeApr(position, { volumeUsd7d, positionValueUsd }),
          ),
        }
      })
      .toSorted((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0)),
  )
  return { query, refetch: positions.refetch }
}
