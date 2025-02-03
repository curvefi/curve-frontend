import { Card, CardHeader, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { t } from '@lingui/macro'

const { Spacing } = SizesAndSpaces

const AdvancedDetails = () => (
  <Card>
    <CardHeader
      size="small"
      title={t`Advanced Details`}
      slotProps={{ title: { variant: 'small' }, root: { variant: 'small' } }}
      sx={{
        alignItems: 'end',
      }}
    />
    <Stack direction="column" spacing={Spacing.md}>
      <Typography variant="bodyMBold">{t`Advanced Details`}</Typography>
    </Stack>
  </Card>
)

export default AdvancedDetails
