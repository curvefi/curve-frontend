import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import type { PointsCampaignRow } from '@ui/features/points-campaigns/points-campaigns.utils'
import { PointsCampaignsTable } from '@ui/features/points-campaigns/PointsCampaignsTable'
import { t } from '@ui/lib/i18n'

export const PointsCampaigns = ({ rows }: { rows: PointsCampaignRow[] }) =>
  rows.length > 0 && (
    <Card size="small">
      <CardHeader title={t`Points Campaigns`} />
      <PointsCampaignsTable rows={rows} />
    </Card>
  )
