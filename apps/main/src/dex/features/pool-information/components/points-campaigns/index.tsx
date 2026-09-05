import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { PointsCampaignsTable } from '@evm-ui/features/points-campaigns/PointsCampaignsTable'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui/lib/i18n'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'

export const PointsCampaigns = ({
  chainId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const { rows } = usePointsCampaigns({
    chainId,
    poolDataCacheOrApi,
  })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <PointsCampaignsTable rows={rows} />
      </Stack>
    )
  )
}
