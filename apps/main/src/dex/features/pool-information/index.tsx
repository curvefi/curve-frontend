import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui/lib/i18n'
import { stackedCardHeadersSx } from '@ui/lib/mui'

export const PoolInformation = ({
  metrics,
  composition,
  alerts,
}: {
  metrics: ReactNode
  composition: ReactNode
  alerts: ReactNode
}) => (
  <Stack sx={stackedCardHeadersSx}>
    <Card size="small">
      <CardHeader title={t`Pool Information`} />
      <CardContent component={Stack}>{metrics}</CardContent>
    </Card>
    {composition}
    {alerts}
  </Stack>
)
