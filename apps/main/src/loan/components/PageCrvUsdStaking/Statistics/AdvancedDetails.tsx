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
        padding: {
          mobile: `${Spacing.lg.mobile} ${Spacing.md.mobile} ${Spacing.sm.mobile}`,
          tablet: `${Spacing.lg.tablet} ${Spacing.md.tablet} ${Spacing.sm.tablet}`,
          desktop: `${Spacing.lg.desktop} ${Spacing.md.desktop} ${Spacing.sm.desktop}`,
        },
        alignItems: 'end',
      }}
    />
    <Stack direction="column" spacing={Spacing.md}>
      <Typography variant="bodyMBold">{t`Advanced Details`}</Typography>
    </Stack>
  </Card>
)

export default AdvancedDetails
