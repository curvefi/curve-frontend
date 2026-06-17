import { ReactNode } from 'react'
import { Box, Button, ButtonProps, Skeleton } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Responsive } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'

const { Spacing, IconSize, MaxWidth, LineHeight } = SizesAndSpaces

type EmptyStateButtonProps = ButtonProps & { label: ReactNode; testId?: string }

type EmptyStateCardProps = {
  title?: ReactNode
  subtitle?: ReactNode
  isLoading?: boolean
  size?: 'sm' | 'md'
  button?: EmptyStateButtonProps
  secondaryButton?: EmptyStateButtonProps
}

const ICON_SIZE: Record<NonNullable<EmptyStateCardProps['size']>, Responsive> = {
  sm: IconSize.lg,
  md: IconSize.xxl,
}

const BUTTON_SIZE: Record<NonNullable<EmptyStateCardProps['size']>, ButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
}

const Skeletons = () => (
  <Stack sx={{ gap: Spacing.sm, width: MaxWidth.emptyStateCard }}>
    <Skeleton variant="rectangular" sx={{ height: LineHeight.sm }} />
    <Skeleton variant="rectangular" sx={{ height: LineHeight.xl }} />
  </Stack>
)

const EmptyStateButton = ({
  button,
  size,
}: {
  button: NonNullable<EmptyStateCardProps['button']>
  size: NonNullable<EmptyStateCardProps['size']>
}) => {
  const { label, sx: buttonSx, testId, fullWidth: buttonFullWidth, ...buttonProps } = button ?? {}
  return (
    <Button
      {...buttonProps}
      variant="outlined"
      size={BUTTON_SIZE[size]}
      sx={applySxProps({ alignSelf: 'center' }, buttonSx)}
      data-testid={testId}
    >
      {label}
    </Button>
  )
}

export const EmptyStateCard = ({
  title,
  subtitle,
  button,
  secondaryButton,
  isLoading,
  size = 'md',
}: EmptyStateCardProps) => (
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
        {(!!button || !!secondaryButton) && (
          <Box
            sx={{
              display: 'grid', // Using grid here for equal sized buttons
              gridTemplateColumns: !!button && !!secondaryButton ? { tablet: '1fr 1fr' } : undefined,
              gap: Spacing.xs,
              justifyContent: 'center',
            }}
          >
            {button && <EmptyStateButton button={button} size={size} />}
            {secondaryButton && <EmptyStateButton button={secondaryButton} size={size} />}
          </Box>
        )}
      </Stack>
    )}
  </Stack>
)
