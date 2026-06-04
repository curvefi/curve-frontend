import { ReactNode } from 'react'
import { Skeleton } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize, MaxWidth, LineHeight } = SizesAndSpaces

const Skeletons = () => (
  <Stack sx={{ gap: Spacing.sm, width: MaxWidth.emptyStateCard }}>
    <Skeleton variant="rectangular" sx={{ height: LineHeight.sm }} />
    <Skeleton variant="rectangular" sx={{ height: LineHeight.xl }} />
  </Stack>
)

export const EmptyStateCard = ({
  title,
  subtitle,
  action,
  isLoading,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  isLoading?: boolean
}) => (
  <Stack
    sx={{
      gap: Spacing.sm,
      alignItems: 'center',
      justifySelf: 'center',
      maxWidth: MaxWidth.emptyStateCard,
    }}
  >
    <LlamaIcon sx={{ width: IconSize.xxl, height: IconSize.xxl }} />
    {isLoading ? (
      <Skeletons />
    ) : (
      <>
        <Stack>
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
      </>
    )}
  </Stack>
)
