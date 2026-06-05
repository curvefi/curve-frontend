import { sum } from 'lodash'
import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import { scanAddressPath } from '@ui/utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { LeverageIcon } from '@ui-kit/shared/icons/LeverageIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain } from '@ui-kit/utils'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils/address'
import type { YieldBreakdownRow } from '../components/yield-breakdown/columns/columns.definitions'

const { IconSize } = SizesAndSpaces

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
  const { data: ethereumNetwork } = useNetworkByChain({ chainId: Chain.Ethereum })
  const rewardsApy = useStore(state => state.pools.rewardsApyMapper[chainId]?.[poolId])
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.networkId as BlockchainId | undefined,
    address: poolAddress,
  })

  // Construct all yield rows imperatively rather than functional to improve readability
  const rows = useMemo(() => {
    const rows: YieldBreakdownRow[] = []
    const crvBase = rewardsApy?.crv?.[0]
    const crvMax = rewardsApy?.crv?.[1] ?? crvBase
    if (crvBase || crvMax) {
      rows.push({
        source: {
          address: MAINNET_CRV_ADDRESS,
          blockchainId: 'ethereum',
          iconPosition: 'left',
          primary: 'CRV',
          secondary: t`Curve DAO`,
        },
        address: MAINNET_CRV_ADDRESS,
        addressUrl: scanAddressPath(ethereumNetwork, MAINNET_CRV_ADDRESS),
        dailyApr: gaugeIsKilled ? undefined : crvMax,
        dailyAprSecondary: gaugeIsKilled ? undefined : crvBase,
        dailyAprTooltip: gaugeIsKilled ? undefined : t`Max CRV tAPR can be reached with max boost for this pool.`,
      })
    }

    rewardsApy?.other?.forEach(({ apy, name, symbol, tokenAddress }) => {
      rows.push({
        source: {
          address: tokenAddress,
          blockchainId: network?.id,
          iconPosition: 'left',
          primary: symbol,
          secondary: name,
        },
        address: tokenAddress,
        addressUrl: scanAddressPath(network, tokenAddress),
        dailyApr: apy,
      })
    })

    campaigns.forEach(({ address, campaignName, description, multiplier, platform, platformImageId, tags }) => {
      const isPointsCampaign = tags.includes('points')
      const sourceAddress = isPointsCampaign ? undefined : address

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
          secondary: campaignName || description || undefined,
        },
        address: sourceAddress,
        addressUrl: sourceAddress && scanAddressPath(network, sourceAddress),
        dailyApr: isPointsCampaign ? undefined : Number(multiplier),
        points: isPointsCampaign ? `${multiplier}x` : undefined,
      })
    })

    const baseDaily = rewardsApy?.base?.day
    if (baseDaily != null && +baseDaily > 0) {
      rows.push({
        source: {
          icon: null,
          iconPosition: 'left',
          primary: t`Swap fees`,
        },
        dailyApr: +baseDaily,
      })
    }

    return rows
  }, [campaigns, ethereumNetwork, gaugeIsKilled, network, rewardsApy])

  return {
    dailyBaseTotal: useMemo(() => sum(rows.map(row => row.dailyAprSecondary)), [rows]),
    dailyTotal: useMemo(() => sum(rows.map(row => row.dailyApr)), [rows]),
    rows,
    showPointsMultiplier: campaigns.some(campaign => campaign.tags.includes('points')),
  }
}
