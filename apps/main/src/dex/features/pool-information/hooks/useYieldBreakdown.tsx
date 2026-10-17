import { sum } from 'lodash'
import { useCallback, useMemo } from 'react'
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
import { BaseRateTooltipContent } from '@ui/features/pools/BaseRateTooltipContent'
import { CrvRateTooltipContent } from '@ui/features/pools/CrvRateTooltipContent'
import type { YieldBreakdownRow } from '@ui/features/pools/yield-breakdown/types'
import { useCombinedQueries } from '@ui/features/queries/combine'
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
  const crvAprs = gaugeIsKilled.data ? undefined : rewards.data?.crv
  const [unboostedCrvRate, maxBoostCrvRate] = [crvAprs?.[0], crvAprs?.[1]]
  const crvRateRange = useMemo(
    () => maybes([unboostedCrvRate, maxBoostCrvRate], (unboostedRate, maximumRate) => ({ unboostedRate, maximumRate })),
    [maxBoostCrvRate, unboostedCrvRate],
  )

  // Construct all yield rows imperatively rather than functional to improve readability
  const rows = useCombinedQueries(
    [rewards, campaigns],
    useCallback(
      (rewards, campaigns) => {
        const rows: YieldBreakdownRow[] = []

        if (rewards?.crv?.some(Boolean)) {
          // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
          rows.push({
            source: { address: MAINNET_CRV_ADDRESS, blockchainId: 'ethereum', iconPosition: 'left', primary: 'CRV' },
            address: getAddress(MAINNET_CRV_ADDRESS),
            displayAddress: shortenAddress(MAINNET_CRV_ADDRESS),
            explorerUrl: scanTokenPath(Chain.Ethereum, MAINNET_CRV_ADDRESS),
            price: crvPrice,
            rate: unboostedCrvRate,
            maxBoostRate: maxBoostCrvRate,
            ...maybe(crvRateRange, range => ({
              rateTooltip: {
                title: t`Gauge APR`,
                body: (
                  <CrvRateTooltipContent
                    {...range}
                    crvToken={{ address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.blockchainId }}
                  />
                ),
                clickable: true,
              },
            })),
          })
        }

        rewards?.other?.forEach(({ apy: rate, symbol, tokenAddress, tokenPrice }) => {
          const address = getAddress(tokenAddress)
          // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
          rows.push({
            source: { address, blockchainId: network?.blockchainId, iconPosition: 'left', primary: symbol },
            address,
            displayAddress: shortenAddress(address),
            explorerUrl: scanTokenPath(chainId, tokenAddress),
            price: tokenPrice ?? fallbackTokenRates[tokenAddress]?.data,
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
            address: maybe(reward.address, getAddress),
            displayAddress: maybe(reward.address, shortenAddress),
            explorerUrl: scanAddressPath(chainId, reward.address),
            price: reward.price,
            rate: reward.value,
          })
        })

        const baseDailyRate = maybe(rewards?.base?.day, Number)
        const baseWeeklyRate = maybe(rewards?.base?.week, Number)

        // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
        rows.push({
          source: { icon: null, iconPosition: 'left', primary: t`Base APR` },
          rate: baseDailyRate,
          rateTooltip: {
            title: t`Base APR`,
            body: <BaseRateTooltipContent dailyRate={baseDailyRate} weeklyRate={baseWeeklyRate} />,
            clickable: true,
          },
        })

        return rows
      },
      [chainId, crvPrice, crvRateRange, fallbackTokenRates, maxBoostCrvRate, network?.blockchainId, unboostedCrvRate],
    ),
  )

  const total = mapQuery(rows, rows => sum(rows.map(row => row.rate)))
  const maxBoostTotal = mapQuery(
    total,
    total => maybe(crvRateRange, ({ unboostedRate, maximumRate }) => total - unboostedRate + maximumRate) ?? 0,
  )

  return { maxBoostTotal, total, rows }
}
