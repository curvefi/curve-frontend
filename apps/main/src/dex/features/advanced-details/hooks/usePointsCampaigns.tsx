import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PointsCampaignsRow } from '../components/points-campaigns/columns/columns.definitions'

const { IconSize } = SizesAndSpaces

export const usePointsCampaigns = ({
  chainId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.networkId as BlockchainId | undefined,
    address: poolAddress,
  })

  const rows = useMemo(
    () =>
      campaigns
        .filter(({ reward }) => reward?.type === 'points')
        .map(
          ({ dashboardLink, reward, platform, platformImageId }): PointsCampaignsRow => ({
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
            multiplier: formatNumber(reward?.value, 'multiplier'),
            campaignUrl: dashboardLink,
          }),
        ),
    [campaigns],
  )

  return { rows }
}
