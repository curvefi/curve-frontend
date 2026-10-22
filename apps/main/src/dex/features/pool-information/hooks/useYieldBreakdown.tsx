import { partition, sum } from 'lodash'
import { type Address, getAddress } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolIsGaugeKilled } from '@/dex/queries/pool-is-gauge-killed.query'
import { usePoolRewardsApy } from '@/dex/queries/pool-rewards-apy.query'
import type { ChainId } from '@/dex/types/main.types'
import { useCampaignsByAddress } from '@evm-ui/queries/campaigns/campaigns.query'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/queries/token-usd-rate.query'
import { MAINNET_CRV, MAINNET_CRV_ADDRESS, shortenAddress } from '@evm-ui/utils/address'
import { scanAddressPath, scanTokenPath } from '@legacy-ui/utils'
import { Chain } from '@primitives/network.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { RewardIcon } from '@ui/components/RewardIcon'
import type { getNetRateTooltipData } from '@ui/features/pool-list/cells/utils'
import { BaseRateTooltipContent } from '@ui/features/pools/BaseRateTooltipContent'
import { CrvRateTooltipContent } from '@ui/features/pools/CrvRateTooltipContent'
import type { YieldBreakdownRow } from '@ui/features/pools/yield-breakdown/types'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const useYieldBreakdown = ({ chainId, poolAddress }: { chainId: ChainId; poolAddress: Address }) => {
  const { data: network } = useNetworkByChain({ chainId })

  // it's called rewards 'APY' but it appears that's fake news and its all APRs
  const rewards = usePoolRewardsApy({ chainId, poolAddress })
  const campaigns = useCampaignsByAddress({ blockchainId: network?.blockchainId, address: poolAddress })

  // For some reason it might be curve-js returns no token price, so we'll try to fall back to our own token rates query.
  const missingTokenRates = mapQuery(
    rewards,
    rewards =>
      rewards.other?.flatMap(({ tokenAddress, tokenPrice }) => (tokenPrice == null ? [tokenAddress] : [])) ?? [],
  )

  const fallbackTokenRates = useTokenUsdRates(
    { chainId, tokenAddresses: missingTokenRates.data },
    !!missingTokenRates.data?.length,
  )

  const { data: crvPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })

  const gaugeIsKilled = usePoolIsGaugeKilled({ chainId, poolAddress })
  const breakdown = combineQueries([rewards, campaigns], (rewards, campaigns) => {
    const [unboostedCrvRate, maxBoostCrvRate] = gaugeIsKilled.data ? [] : rewards.crv
    const crvRateRange = maybes([unboostedCrvRate, maxBoostCrvRate], (unboostedRate, boostedRate) => ({
      unboostedRate,
      boostedRate,
    }))
    const baseRate = maybe(rewards.base.day, Number)
    const baseWeeklyRate = maybe(rewards.base.week, Number)
    const extraRewards = rewards.other.map(({ apy: apr, name, symbol, tokenAddress, tokenPrice }) => ({
      address: getAddress(tokenAddress),
      apr,
      name,
      symbol,
      tokenAddress,
      tokenPrice,
    }))
    const [aprCampaigns, pointsCampaigns] = partition(campaigns, ({ reward }) => reward?.type === 'apr')

    // Construct all yield rows imperatively rather than functional to improve readability
    const rows: YieldBreakdownRow[] = []

    if (rewards.crv.some(Boolean)) {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: { address: MAINNET_CRV_ADDRESS, blockchainId: 'ethereum', iconPosition: 'left', primary: 'CRV' },
        address: getAddress(MAINNET_CRV_ADDRESS),
        displayAddress: shortenAddress(MAINNET_CRV_ADDRESS),
        explorerUrl: scanTokenPath(Chain.Ethereum, MAINNET_CRV_ADDRESS),
        price: crvPrice,
        rate: unboostedCrvRate,
        maxBoostRate: maxBoostCrvRate,
        ...maybe(crvRateRange, ({ unboostedRate, boostedRate }) => ({
          rateTooltip: {
            title: t`Gauge APR`,
            body: (
              <CrvRateTooltipContent
                unboostedRate={unboostedRate}
                maximumRate={boostedRate}
                crvToken={{ address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.blockchainId }}
              />
            ),
            clickable: true,
          },
        })),
      })
    }

    extraRewards.forEach(({ apr: rate, address, symbol, tokenAddress, tokenPrice }) => {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: { address, blockchainId: network.blockchainId, iconPosition: 'left', primary: symbol },
        address,
        displayAddress: shortenAddress(address),
        explorerUrl: scanTokenPath(chainId, tokenAddress),
        price: tokenPrice ?? fallbackTokenRates[tokenAddress]?.data,
        rate,
      })
    })

    aprCampaigns.forEach(({ reward, symbol, platform, platformImageId }) => {
      if (reward?.type !== 'apr') return

      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
          iconPosition: 'left',
          primary: symbol,
        },
        address: maybe(reward.address, getAddress),
        displayAddress: maybe(reward.address, shortenAddress),
        explorerUrl: scanAddressPath(chainId, reward.address),
        price: reward.price,
        rate: reward.value,
      })
    })

    // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
    rows.push({
      source: { icon: null, iconPosition: 'left', primary: t`Base APR` },
      rate: baseRate,
      rateTooltip: {
        title: t`Base APR`,
        body: <BaseRateTooltipContent dailyRate={baseRate} weeklyRate={baseWeeklyRate} />,
        clickable: true,
      },
    })

    const total = sum(rows.map(row => row.rate))
    const maxBoostTotal =
      maybe(crvRateRange, ({ unboostedRate, boostedRate }) => total - unboostedRate + boostedRate) ?? 0

    const tooltipData: ReturnType<typeof getNetRateTooltipData> = {
      blockchainId: network.blockchainId,
      baseRate,
      netRate: total,
      maxNetRate: maxBoostTotal,
      crvRateRange: maxBoostTotal && maxBoostTotal !== total ? (crvRateRange ?? null) : null,
      incentiveItems:
        unboostedCrvRate || extraRewards.length || aprCampaigns.length
          ? { incentivesRate: total - (baseRate ?? 0), unboostedCrvRate, extraRewards, campaigns: aprCampaigns }
          : null,
      pointsCampaigns,
    }
    return { rows, total, maxBoostTotal, tooltipData }
  })

  return {
    rows: mapQuery(breakdown, ({ rows }) => rows),
    total: mapQuery(breakdown, ({ total }) => total),
    maxBoostTotal: mapQuery(breakdown, ({ maxBoostTotal }) => maxBoostTotal),
    tooltipData: mapQuery(breakdown, ({ tooltipData }) => tooltipData),
  }
}
