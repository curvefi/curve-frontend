import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize, MaxWidth } = SizesAndSpaces

export const EmptyStateCard = ({
  title,
  subtitle,
  action,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
}) => (
  <Stack
    direction="column"
    sx={{
      gap: Spacing.sm,
      alignItems: 'center',
      justifySelf: 'center',
      maxWidth: MaxWidth.emptyStateCard,
    }}
  >
    <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
    {/* Needed because no gap between the title and subtitle */}
    <Stack direction="column">
      {title && (
        <Typography component="span" variant="headingSBold" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography component="span" variant="bodyMRegular" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
    {action}
  </Stack>
)
