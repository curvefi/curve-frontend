import { ReactNode } from 'react'
import { Button, ButtonProps, Skeleton } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Responsive } from '@ui-kit/themes/basic-theme'

const { Spacing, IconSize, MaxWidth, LineHeight } = SizesAndSpaces

type EmptyStateCardProps = {
  title?: string
  subtitle?: string
  action?: { label: ReactNode; onClick?: () => void }
  isLoading?: boolean
  size: 'sm' | 'md'
}

const ICON_SIZE: Record<EmptyStateCardProps['size'], Responsive> = {
  sm: IconSize.lg,
  md: IconSize.xxl,
}

const BUTTON_SIZE: Record<EmptyStateCardProps['size'], ButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
}

const Skeletons = () => (
  <Stack sx={{ gap: Spacing.sm, width: MaxWidth.emptyStateCard }}>
    <Skeleton variant="rectangular" sx={{ height: LineHeight.sm }} />
    <Skeleton variant="rectangular" sx={{ height: LineHeight.xl }} />
  </Stack>
)

export const EmptyStateCard = ({ title, subtitle, action, isLoading, size = 'md' }: EmptyStateCardProps) => (
  <Stack
    sx={{
      gap: Spacing.xs,
      alignItems: 'center',
      justifySelf: 'center',
      maxWidth: MaxWidth.emptyStateCard,
    }}
  >
    <LlamaIcon sx={{ width: ICON_SIZE[size], height: ICON_SIZE[size] }} />
    {isLoading ? (
      <Skeletons />
    ) : (
      <Stack sx={{ gap: Spacing.sm }}>
        <Stack sx={{ textAlign: 'center' }}>
          {title && (
            <Typography component="span" variant="headingXsBold">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography component="span" variant="bodySRegular" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {action && (
          <Button variant="outlined" size={BUTTON_SIZE[size]} onClick={action.onClick} sx={{ alignSelf: 'center' }}>
            {action.label}
          </Button>
        )}
      </Stack>
    )}
  </Stack>
)
