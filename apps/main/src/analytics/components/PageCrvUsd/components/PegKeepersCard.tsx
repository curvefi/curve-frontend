import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { t } from '@ui-kit/lib/i18n'
import { PegKeepersTable } from './PegKeepersTable'

export const PegKeepersCard = () => (
  <Card size="small" sx={{ height: '100%' }}>
    <CardHeader title={t`PegKeepers`} />
    <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
      <PegKeepersTable />
    </CardContent>
  </Card>
)
