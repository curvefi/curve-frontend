import { sum } from 'lodash'
import { useMemo } from 'react'
import { type Address } from 'viem'
import { BaseApyTooltipContent } from '@/dex/components/BaseApyTooltipContent'
import { useNetworkByChain } from '@/dex/entities/networks'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import { maybe } from '@primitives/objects.utils'
import { scanAddressPath, scanTokenPath } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AVERAGE_CATEGORIES, Chain } from '@ui-kit/utils'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils/address'
import { aprToApy } from '@ui-kit/utils/rates'
import type { YieldBreakdownRow } from '../components/yield-breakdown/columns/columns.definitions'

const { IconSize } = SizesAndSpaces
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
    blockchainId: network?.networkId as BlockchainId | undefined,
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
        explorerUrl: scanTokenPath(defaultNetworks[Chain.Ethereum], MAINNET_CRV_ADDRESS),
        price: crvPrice,
        ...(!gaugeIsKilled && {
          apy: aprToApy(rewardsApy?.crv?.[1] ?? rewardsApy?.crv?.[0], COMPOUND_WINDOW) ?? undefined,
          apySecondary: aprToApy(rewardsApy?.crv?.[0], COMPOUND_WINDOW) ?? undefined,
          apyTooltip: { title: t`Max CRV APY can be reached with max boost for this pool.` },
        }),
      })
    }

    rewardsApy?.other?.forEach(({ apy, symbol, tokenAddress, tokenPrice }) => {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          address: tokenAddress,
          blockchainId: network?.id,
          iconPosition: 'left',
          primary: symbol,
        },
        address: tokenAddress,
        explorerUrl: scanTokenPath(network, tokenAddress),
        price: tokenPrice ?? fallbackTokenRates?.[tokenAddress],
        apy: aprToApy(apy, COMPOUND_WINDOW) ?? undefined,
      })
    })

    campaigns
      .filter(({ reward }) => reward?.type === 'apr')
      .forEach(({ address, reward, platform, platformImageId }) => {
        // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
        rows.push({
          source: {
            icon: (
              <Box
                component="img"
                src={platformImageId}
                alt={platform}
                sx={{ borderRadius: '50%', width: IconSize.lg, height: IconSize.lg }}
              />
            ),
            iconPosition: 'left',
            primary: platform,
          },
          address,
          explorerUrl: scanAddressPath(network, address),
          apy: aprToApy(reward?.value, COMPOUND_WINDOW) ?? undefined,
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
  }, [campaigns, crvPrice, fallbackTokenRates, gaugeIsKilled, network, rewardsApy])

  return {
    baseTotal: useMemo(() => sum(rows.map(row => row.apySecondary ?? row.apy)), [rows]),
    total: useMemo(() => sum(rows.map(row => row.apy)), [rows]),
    rows,
  }
}
