import { sum } from 'lodash'
import { useMemo } from 'react'
import { type Address } from 'viem'
import { BaseRateTooltipContent } from '@/dex/components/BaseRateTooltipContent'
import { CrvRateTooltipContent } from '@/dex/components/CrvRateTooltipContent'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { Chain } from '@evm-ui/utils'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils/address'
import { scanAddressPath, scanTokenPath } from '@legacy-ui/utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { YieldBreakdownRow } from '../components/yield-breakdown/columns/columns.definitions'

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

  // it's called rewards 'APY' but it appears that's fake news and its all APRs
  const rewards = useStore(state => state.pools.rewardsApyMapper[chainId]?.[poolId])

  const { data: campaigns } = useCampaignsByAddress({ blockchainId: network?.blockchainId, address: poolAddress })

  // For some reason it might be curve-js returns no token price, so we'll try to fall back to our own token rates query.
  const missingTokenRates = useMemo(
    () => rewards?.other?.flatMap(({ tokenAddress, tokenPrice }) => (tokenPrice == null ? [tokenAddress] : [])) ?? [],
    [rewards?.other],
  )
  const { data: fallbackTokenRates } = useTokenUsdRates(
    { chainId, tokenAddresses: missingTokenRates },
    missingTokenRates.length > 0,
  )

  const { data: crvPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })

  const crvAprs = gaugeIsKilled ? undefined : rewards?.crv
  const [unboostedCrvRate, maxBoostCrvRate] = [crvAprs?.[0], crvAprs?.[1]]
  const crvRateRange = useMemo(
    () => maybes([unboostedCrvRate, maxBoostCrvRate], (unboostedRate, maximumRate) => ({ unboostedRate, maximumRate })),
    [maxBoostCrvRate, unboostedCrvRate],
  )

  // Construct all yield rows imperatively rather than functional to improve readability
  const rows: YieldBreakdownRow[] = useMemo(() => {
    const rows: YieldBreakdownRow[] = []

    if (rewards?.crv?.some(Boolean)) {
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
        rate: unboostedCrvRate,
        maxBoostRate: maxBoostCrvRate,
        ...maybe(crvRateRange, range => ({
          apyTooltip: {
            title: t`Gauge APR`,
            body: <CrvRateTooltipContent {...range} />,
            clickable: true,
          },
        })),
      })
    }

    rewards?.other?.forEach(({ apy: rate, symbol, tokenAddress, tokenPrice }) => {
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
        rate,
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
        rate: reward.value,
      })
    })

    const baseDailyRate = maybe(rewards?.base?.day, Number)
    const baseWeeklyRate = maybe(rewards?.base?.week, Number)

    // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
    rows.push({
      source: {
        icon: null,
        iconPosition: 'left',
        primary: t`Base APR`,
      },
      rate: baseDailyRate,
      rateTooltip: {
        title: t`Base APR`,
        body: <BaseRateTooltipContent dailyRate={baseDailyRate} weeklyRate={baseWeeklyRate} />,
        clickable: true,
      },
    })

    return rows
  }, [
    rewards?.crv,
    rewards?.other,
    rewards?.base?.day,
    rewards?.base?.week,
    campaigns,
    crvPrice,
    unboostedCrvRate,
    maxBoostCrvRate,
    crvRateRange,
    network?.blockchainId,
    chainId,
    fallbackTokenRates,
  ])

  const total = useMemo(() => sum(rows.map(row => row.rate)), [rows])

  return {
    maxBoostTotal: maybe(crvRateRange, ({ unboostedRate, maximumRate }) => total - unboostedRate + maximumRate) ?? 0,
    total,
    rows,
  }
}
