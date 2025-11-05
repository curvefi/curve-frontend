import { Box, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

export const EmptyState = ({ isError }: { isError: boolean }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Spacing.md }}>
    <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
    <Typography variant="bodyMRegular" color="textPrimary" component="div">
      {isError ? t`Error loading bands data` : t`No bands data found`}
    </Typography>
  </Box>
)
