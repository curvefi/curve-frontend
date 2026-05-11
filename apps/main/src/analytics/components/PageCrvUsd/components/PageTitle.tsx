import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PageTitle = () => (
  <Stack gap={Spacing.xs}>
    <Typography variant="headingSBold">{t`crvUSD`}</Typography>
  </Stack>
)
