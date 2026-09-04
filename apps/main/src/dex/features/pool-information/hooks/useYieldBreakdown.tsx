import { sum } from 'lodash'
import { useMemo } from 'react'
import { type Address } from 'viem'
import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { CrvApyTooltipContent } from '@/dex/components/CrvApyTooltipContent'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils/address'
import { aprToApy } from '@evm-ui/utils/rates'
import { scanAddressPath, scanTokenPath } from '@legacy-ui/utils'
import { Chain } from '@primitives/network.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import type { YieldBreakdownRow } from '../components/yield-breakdown/columns/columns.definitions'

const COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window

export const useYieldBreakdown = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
}) => {
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const gaugeIsKilled = !!poolDataCacheOrApi.gauge.isKilled
  const { data: network } = useNetworkByChain({ chainId })
  const rewardsApy = useStore(state => state.pools.rewardsApyMapper[chainId]?.[poolId])

  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.blockchainId,
    address: poolAddress,
  })

  // For some reason it might be curve-js returns no token price, so we'll try to fall back to our own token rates query.
  const missingTokenRates = useMemo(
    () =>
      rewardsApy?.other?.flatMap(({ tokenAddress, tokenPrice }) => (tokenPrice == null ? [tokenAddress] : [])) ?? [],
    [rewardsApy?.other],
  )
  const { data: fallbackTokenRates } = useTokenUsdRates(
    { chainId, tokenAddresses: missingTokenRates },
    missingTokenRates.length > 0,
  )

  const { data: crvPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })
  const crvAprs = gaugeIsKilled ? undefined : rewardsApy?.crv
  const unboostedCrvApy = maybe(crvAprs?.[0], apr => aprToApy(apr, COMPOUND_WINDOW))
  const maxBoostCrvApy = maybe(crvAprs?.[1], apr => aprToApy(apr, COMPOUND_WINDOW))
  const crvApyRange = useMemo(
    () =>
      maybes([unboostedCrvApy, maxBoostCrvApy], (unboostedApy, maximumApy) => ({
        unboostedApy,
        maximumApy,
      })),
    [maxBoostCrvApy, unboostedCrvApy],
  )

  // Construct all yield rows imperatively rather than functional to improve readability
  const rows: YieldBreakdownRow[] = useMemo(() => {
    const rows: YieldBreakdownRow[] = []

    if (rewardsApy?.crv?.some(Boolean)) {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          address: MAINNET_CRV_ADDRESS,
          blockchainId: 'ethereum',
          iconPosition: 'left',
          primary: 'CRV',
        },
        address: MAINNET_CRV_ADDRESS,
        explorerUrl: scanTokenPath(Chain.Ethereum, MAINNET_CRV_ADDRESS),
        price: crvPrice,
        apy: unboostedCrvApy,
        maxBoostApy: maxBoostCrvApy,
        ...maybe(crvApyRange, apyRange => ({
          apyTooltip: {
            title: t`Gauge APY`,
            body: <CrvApyTooltipContent {...apyRange} />,
            clickable: true,
          },
        })),
      })
    }

    rewardsApy?.other?.forEach(({ apy, symbol, tokenAddress, tokenPrice }) => {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          address: tokenAddress,
          blockchainId: network?.blockchainId,
          iconPosition: 'left',
          primary: symbol,
        },
        address: tokenAddress,
        explorerUrl: scanTokenPath(chainId, tokenAddress),
        price: tokenPrice ?? fallbackTokenRates?.[tokenAddress],
        apy: aprToApy(apy, COMPOUND_WINDOW),
      })
    })

    campaigns.forEach(({ reward, symbol, platform, platformImageId }) => {
      if (reward?.type !== 'apr') return

      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
          iconPosition: 'left',
          primary: symbol,
        },
        address: reward.address,
        explorerUrl: scanAddressPath(chainId, reward.address),
        price: reward.price,
        apy: aprToApy(reward.value, COMPOUND_WINDOW),
      })
    })

    const baseDailyApy = maybe(rewardsApy?.base?.day, Number)
    const baseWeeklyApy = maybe(rewardsApy?.base?.week, Number)

    // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
    rows.push({
      source: {
        icon: null,
        iconPosition: 'left',
        primary: t`Base APY`,
      },
      apy: baseDailyApy,
      apyTooltip: {
        title: t`Base APY`,
        body: <BaseApyTooltipContent dailyApy={baseDailyApy} weeklyApy={baseWeeklyApy} />,
        clickable: true,
      },
    })

    return rows
  }, [
    rewardsApy?.crv,
    rewardsApy?.other,
    rewardsApy?.base?.day,
    rewardsApy?.base?.week,
    campaigns,
    crvPrice,
    unboostedCrvApy,
    maxBoostCrvApy,
    crvApyRange,
    network?.blockchainId,
    chainId,
    fallbackTokenRates,
  ])

  const total = useMemo(() => sum(rows.map(row => row.apy)), [rows])

  return {
    maxBoostTotal: maybe(crvApyRange, ({ unboostedApy, maximumApy }) => total - unboostedApy + maximumApy) ?? 0,
    total,
    rows,
  }
}
