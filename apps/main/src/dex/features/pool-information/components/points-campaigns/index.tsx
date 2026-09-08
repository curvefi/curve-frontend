import { usePoolContext } from '@/dex/features/pool-context'
import { PointsCampaignsTable } from '@evm-ui/features/points-campaigns/PointsCampaignsTable'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui/lib/i18n'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'

export const PointsCampaigns = () => {
  const { chainId, poolData } = usePoolContext()
  const { rows } = usePointsCampaigns({ chainId, poolData })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <PointsCampaignsTable rows={rows} />
      </Stack>
    )
  )
}
