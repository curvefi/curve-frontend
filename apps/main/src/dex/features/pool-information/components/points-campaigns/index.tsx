import { usePoolContext } from '@/dex/features/pool-context'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { PointsCampaignsTable } from '@ui/features/points-campaigns/PointsCampaignsTable'
import { t } from '@ui/lib/i18n'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'

export const PointsCampaigns = () => {
  const { chainId, poolAddress } = usePoolContext()
  const { rows } = usePointsCampaigns({ chainId, poolAddress })

  return (
    rows.length > 0 && (
      <Card size="small">
        <CardHeader title={t`Points Campaigns`} />
        <PointsCampaignsTable rows={rows} />
      </Card>
    )
  )
}
