import { usePoolContext } from '@/dex/features/pool-context'
import { PointsCampaignsTable } from '@evm-ui/features/points-campaigns/PointsCampaignsTable'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { t } from '@ui/lib/i18n'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'

export const PointsCampaigns = () => {
  const { chainId, pool } = usePoolContext()
  const { rows } = usePointsCampaigns({ chainId, pool })

  return (
    rows.length > 0 && (
      <Card size="small">
        <CardHeader title={t`Points Campaigns`} />
        <PointsCampaignsTable rows={rows} />
      </Card>
    )
  )
}
