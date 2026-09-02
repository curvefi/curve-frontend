import { useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getPoolAddress } from '@/dex/utils'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import type { PointsCampaignsRow } from '../components/points-campaigns/columns/columns.definitions'

const { IconSize } = SizesAndSpaces

export const usePointsCampaigns = ({
  chainId,
  poolQuery,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const poolDataCacheOrApi = poolQuery.data
  const poolAddress = getPoolAddress(poolDataCacheOrApi)
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.networkId,
    address: poolAddress,
  })

  const rows = useMemo(
    () =>
      campaigns
        .filter(({ reward, symbol }) => reward?.type === 'points' || (!reward?.type && symbol))
        .map(({ dashboardLink, reward, platform, platformImageId, symbol }): PointsCampaignsRow => ({
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
          multiplier: reward?.value != null || symbol == null ? formatNumber(reward?.value, 'multiplier') : symbol,
          campaignUrl: dashboardLink,
        })),
    [campaigns],
  )

  return { query: mapQuery(poolQuery, () => rows), rows }
}
