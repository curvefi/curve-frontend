import { getAddress } from 'viem'
import { usePoolContext } from '@/dex/features/pool-context'
import { useYieldBreakdown } from '@/dex/features/pool-information/hooks/useYieldBreakdown'
import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { MAINNET_CRV } from '@evm-ui/utils/address'
import { zip } from '@primitives/array.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { NetRateTooltipContent } from '@ui/features/pool-list/cells/NetRateTooltipContent'
import { isVolatileRate } from '@ui/features/pool-list/cells/utils'
import { PoolDetailsHeader } from '@ui/features/pools/PoolDetailsHeader'
import { PoolHeaderMetrics } from '@ui/features/pools/PoolHeaderMetrics'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, fallbackQ, mapQuery, type QueryProp } from '@ui/features/queries/util'
import { amount } from '@ui/lib/decimal'

const usePoolRate = () => {
  const { chainId, blockchainId, poolAddress } = usePoolContext()
  const { total, maxBoostTotal, rewards, campaigns, unboostedCrvRate, maxBoostCrvRate } = useYieldBreakdown({
    chainId,
    poolAddress,
  })
  const baseRate = maybe(rewards.data?.base.day, Number)
  const extraRewards =
    rewards.data?.other.map(({ apy, tokenAddress, name, symbol }) => ({
      address: getAddress(tokenAddress),
      apr: apy,
      name,
      symbol,
    })) ?? []
  const aprCampaigns = campaigns.data.filter(({ reward }) => reward?.type === 'apr')

  return {
    netApr: total,
    netAprTooltip: maybe(total.data, netRate => (
      <NetRateTooltipContent
        blockchainId={blockchainId}
        baseRate={baseRate}
        netRate={netRate}
        maxNetRate={maxBoostTotal.data}
        crvRateRange={
          maxBoostTotal.data && maxBoostTotal.data !== netRate
            ? (maybes([unboostedCrvRate, maxBoostCrvRate], (unboostedRate, boostedRate) => ({
                unboostedRate,
                boostedRate,
              })) ?? null)
            : null
        }
        incentiveItems={
          unboostedCrvRate || extraRewards.length || aprCampaigns.length
            ? { incentivesRate: netRate - (baseRate ?? 0), unboostedCrvRate, extraRewards, campaigns: aprCampaigns }
            : null
        }
        pointsCampaigns={campaigns.data.filter(({ reward }) => reward?.type !== 'apr')}
        crvToken={MAINNET_CRV}
        volatile={isVolatileRate(netRate)}
      />
    )),
  }
}

export const PoolPageHeader = ({
  pricesApiPoolData,
  backHref,
}: {
  pricesApiPoolData: QueryProp<PricesApiPool>
  backHref: string
}) => {
  const { chainId, blockchainId, poolAddress, pool, tokens, tokenAddresses } = usePoolContext()
  const tvl = usePoolTvl({ chainId, poolAddress })
  const volume = usePoolVolume({ chainId, poolAddress })
  const rate = usePoolRate()

  return (
    <PoolDetailsHeader
      backHref={backHref}
      title={mapQuery(pool, pool => pool.name)}
      tokens={
        combineQueries([tokens, tokenAddresses], (tokens, tokenAddresses) =>
          zip(tokens, tokenAddresses)
            .filter(([, address]) => address)
            .map(([symbol, address]) => constQ({ symbol, address })),
        ).data
      }
      blockchainId={blockchainId}
      rightItems={
        <PoolHeaderMetrics
          {...rate}
          tvl={fallbackQ(
            mapQuery(tvl, tvl => amount(tvl)),
            mapQuery(pricesApiPoolData, pool => amount(pool.tvlUsd)),
          )}
          volume24h={fallbackQ(
            mapQuery(volume, volume => amount(volume)),
            mapQuery(pricesApiPoolData, pool => amount(pool.tradingVolume24h)),
          )}
        />
      }
    />
  )
}
