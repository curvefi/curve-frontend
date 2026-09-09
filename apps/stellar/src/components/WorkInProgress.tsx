import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { MaxWidth, MinHeight } = SizesAndSpaces

export const WorkInProgress = () => (
  <Stack sx={{ minHeight: MinHeight.pageContent, justifyContent: 'center' }}>
    <Card sx={{ maxWidth: MaxWidth.actionCard, margin: '0 auto' }}>
      <EmptyStateCard title={t`Work in progress`} description={t`We are working on it`} />
    </Card>
  </Stack>
)
